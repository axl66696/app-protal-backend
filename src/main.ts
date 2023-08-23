import { ControllerService, JetStreamService } from '@his-base/jetstream';
import { serverConfig } from './server.config';

export class NatsServer {
  async bootstrap() {
    const jetStreamServer = new JetStreamService(serverConfig);
    await jetStreamServer.connect();

    const controllerService = new ControllerService();

    const controllerFiles = await import('./controllers');
    const controllers = Object.values(controllerFiles).map(
      (Class: any) => new Class(),
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
        } else message.ack();
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
