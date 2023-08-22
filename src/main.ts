import { NatsJetStreamServer } from './services/jetstream.service';
import { ControllerService } from './services/controller.service';

(async () => {
  const jetStreamServer = new NatsJetStreamServer();
  await jetStreamServer.connect();

  const controllerService = new ControllerService();

  const controllers = await import('./controllers');
  Object.values(controllers).forEach((ControllerClass) => {
    const controller = new ControllerClass();
    const { subjectPrefix, subscribers } =
      controllerService.getControllerMetadata(controller);

    jetStreamServer.subscribe(subjectPrefix, (message, payload) => {
      const shortSubject = message.subject.split(`${subjectPrefix}.`)[1];
      const foundSubscriber = subscribers.find(
        (x) => x.subject === shortSubject,
      );
      if (!foundSubscriber) return;

      controller[foundSubscriber.methodName](message, payload);
    });

    console.log(`Listening on subject ${subjectPrefix}.>`);
  });
})();
