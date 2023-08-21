import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NatsJetStreamServer } from './jetstream/jetstream.service';
import { readdirSync } from 'fs';
import { ConsumerMeta } from './types';
import { subjectToConsumer } from './helpers';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.get(NatsJetStreamServer);
  appService.options = {
    connectionOptions: {
      servers: 'localhost:4222',
      name: 'create-service',
    },
  };
  await appService.connect();

  const srcFiles = readdirSync(__dirname);
  const folders = srcFiles.filter((filename) => !filename.includes('.'));

  folders.forEach(async (folder) => {
    const folderDir = __dirname.concat(`/${folder}`);
    const files = readdirSync(folderDir);
    const controllerFile = files.find(
      (file) => file.includes('controller') && !file.includes('controller.d'),
    );

    if (!controllerFile) return;

    const ControllerModule = await import(`${folderDir}/${controllerFile}`);
    const ControllerClass = ControllerModule.default;

    if (!ControllerClass) return;

    const controller = new ControllerClass();
    const subjectPrefix = Reflect.getMetadata('subjectPrefix', ControllerClass);
    const consumers =
      (Reflect.getMetadata('consumers', controller) as ConsumerMeta[]) || [];

    consumers.forEach((consumer) => {
      const subject = `${subjectPrefix}.${consumer.subject}`;
      const consumerName = subjectToConsumer(subject);

      appService.subscribeMessage(
        'OPD',
        consumerName,
        controller[consumer.methodName],
      );

      console.log(`Listening on subject ${subject}`);
    });
  });
}
bootstrap();
