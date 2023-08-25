import { ControllerService, JetStreamService } from '@his-base/jetstream';
import { serverConfig } from './server.config';
import { MongoBaseService } from '@his-base/mongo-base';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class NatsServer {
  async bootstrap() {
    const jetStreamServer = new JetStreamService(serverConfig);
    await jetStreamServer.connect();

    const mongoService = new MongoBaseService(
      'mongodb://localhost:27017',
      'OPD',
    );

    const controllerService = new ControllerService(
      mongoService,
      jetStreamServer,
    );

    const controllers = await controllerService.getAllControllers(
      `${__dirname}/controllers`,
    );
    controllers.forEach((controller) => {
      const { consumer, subscribers, repliers } =
        controllerService.getControllerMetadata(controller);

      jetStreamServer.subscribe(consumer, (message, payload) => {
        const foundSubscriber = subscribers.find(
          (x) => `${consumer}.${x.subject}` === message.subject,
        );

        if (foundSubscriber) {
          controller[foundSubscriber.methodName](message, payload);
        } else message.nak();
      });

      console.log(`Listening on subject ${consumer}.>`);

      repliers.forEach(({ subject, methodName }) => {
        const fullSubject = `${consumer}.${subject}`;
        jetStreamServer.reply(fullSubject, (message, payload, jsonCodec) => {
          controller[methodName](message, payload, jsonCodec);
        });

        console.log(`Replying on subject ${fullSubject}`);
      });
    });
  }
}

const natsServer = new NatsServer();
natsServer.bootstrap();
