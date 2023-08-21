import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NatsJetStreamServer } from './services/jetstream.service';
import { readdirSync } from 'fs';
import { ControllerMetadata } from './types';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jetStreamServer = app.get(NatsJetStreamServer);
  await jetStreamServer.connect();

  const controllerFilePaths = findControllerFiles();
  for (const controllerFilePath of controllerFilePaths) {
    const ControllerModule = await import(controllerFilePath);
    const ControllerClass = ControllerModule.default;
    if (!ControllerClass) continue;

    const controller = new ControllerClass();
    const { subjectPrefix, consumers } = getControllerMetadata(controller);

    jetStreamServer.subscribeMessage(subjectPrefix, (message, payload) => {
      const shortSubject = message.subject.split(`${subjectPrefix}.`)[1];
      const foundConsumer = consumers.find((x) => x.subject === shortSubject);
      if (!foundConsumer) return;

      controller[foundConsumer.methodName](message, payload);
    });

    console.log(`Listening on subject ${subjectPrefix}.>`);
  }
}

function findControllerFiles() {
  const controllerFiles = readdirSync(`${__dirname}/controllers`)
    .filter((file) => file.endsWith('controller.js'))
    .map((file) => `${__dirname}/controllers/${file}`);

  return controllerFiles;
}

function getControllerMetadata(controller: any): ControllerMetadata {
  const ControllerClass = controller.constructor;
  return {
    subjectPrefix: Reflect.getMetadata('subjectPrefix', ControllerClass),
    consumers: Reflect.getMetadata('consumers', controller) || [],
  };
}

main();
