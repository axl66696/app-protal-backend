import { NatsJetStreamServer } from './lib/jetstream.service';
import { ControllerService } from './lib/controller.service';
import { serverConfig } from './server.config';

export class NatsServer {
  async bootstrap() {
    const jetStreamServer = new NatsJetStreamServer(serverConfig);
    await jetStreamServer.connect();

    const controllerService = new ControllerService();

    const controllers = await controllerService.getAllControllers();
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
