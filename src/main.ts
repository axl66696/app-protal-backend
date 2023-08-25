import {
  ControllerService,
  JetStreamServiceProvider,
} from '@his-base/jetstream';
import { serverConfig } from './server.config';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class NatsServer {
  async bootstrap() {
    await JetStreamServiceProvider.initialize(serverConfig);
    const jetStreamServer = JetStreamServiceProvider.get();

    const controllerService = new ControllerService();

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
