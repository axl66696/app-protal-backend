import { NatsJetStreamServer } from './services/jetstream.service';
import { ControllerService } from './services/controller.service';

(async () => {
  const jetStreamServer = new NatsJetStreamServer({
    servers: 'localhost:4222',
    stream: 'OPD',
  });
  await jetStreamServer.connect();

  const controllerService = new ControllerService();

  const controllers = await controllerService.getAllControllers();
  controllers.forEach((controller) => {
    const { subjectPrefix, subscribers } =
      controllerService.getControllerMetadata(controller);

    jetStreamServer.subscribe(subjectPrefix, (message, payload) => {
      const foundSubscriber = subscribers.find(
        (x) => `${subjectPrefix}.${x.subject}` === message.subject,
      );
      if (!foundSubscriber) return;

      controller[foundSubscriber.methodName](message, payload);
    });

    console.log(`Listening on subject ${subjectPrefix}.>`);
  });
})();
