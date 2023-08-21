// main.ts
import { JSONCodec, connect } from 'nats';
import * as path from 'path';
import * as fs from 'fs';
import 'reflect-metadata';
import { ConsumerMeta, Json } from './types';
import { subjectToConsumer } from './helper';

(async () => {
  try {
    console.log('Server is up and running!')
    const nc = await connect({ servers: 'nats://localhost:4222' });
    const jetStreamClient = nc.jetstream();
    const jc = JSONCodec();
  
    const controllersDir = path.join(__dirname, 'controllers');
    const controllerFiles = fs.readdirSync(controllersDir);
  
    for (const file of controllerFiles) {
      const filePath = path.join(controllersDir, file);
      const ControllerModule = require(filePath);
      const ControllerClass = ControllerModule.default;

      if (ControllerClass) {
        const controllerInstance = new ControllerClass();

        const subjectPrefix = Reflect.getMetadata('subjectPrefix', ControllerClass);
        const consumers = Reflect.getMetadata('consumers', controllerInstance) as ConsumerMeta[];

        consumers.forEach(async (consumer) => {
          const subject = `${subjectPrefix}.${consumer.subject}`;
          const consumerName = subjectToConsumer(subject);

          try {
            const natsConsumer = await jetStreamClient.consumers.get('his', consumerName);
            const consumerMessages = await natsConsumer.consume();

            (async () => {
              for await (const message of consumerMessages) {
                try {
                  console.log(`Got message! From subject ${message.subject} --> ${message.string()}`);
                  message.ack();

                  const decodedMessage = jc.decode(message.data) as Json;
                  controllerInstance[consumer.methodName](decodedMessage);
                } catch (error) {
                  console.error(`Error while getting message of subject ${subject}: `, error);
                }
              }
            })();

            console.log(`Listening on subject ${subject}`);
          } catch (error) {
            console.error(`Error while creating consumer ${consumerName}: `)
          }
        });
      }
    }
  } catch (error) {
    console.error(error)
  }
})();
