import { Injectable } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import {
  Codec,
  JSONCodec,
  JetStreamClient,
  JsMsg,
  NatsConnection,
  connect,
} from 'nats';
import { Json } from 'src/types';

@Injectable()
export class NatsJetStreamServer
  extends Server
  implements CustomTransportStrategy
{
  #nc: NatsConnection;
  #codec: Codec<Json> = JSONCodec();
  #js!: JetStreamClient;

  async listen(callback: () => void) {
    await this.connect();
    callback();
  }

  async connect() {
    if (this.#nc) return;

    this.#nc = await connect({ servers: 'localhost:4222' });
    this.#js = this.#nc.jetstream();
  }

  async subscribeMessage(
    stream: string,
    name: string,
    callback: (message: JsMsg, payload: Json) => void,
  ) {
    const consumer = await this.#js.consumers.get(stream, name);
    const messages = await consumer.consume();

    for await (const message of messages) {
      try {
        const payload = this.#codec.decode(message.data);
        console.log(`Got message from subject ${message.subject}: ${payload}`);

        callback(message, payload);
      } catch (error) {
        console.error(
          `Error getting message of subject ${message.subject}: `,
          error,
        );
      }
    }
  }

  async close() {
    await this.#nc.drain();
    this.#nc = undefined;
  }

  async publishMessage(subject: string, payload: any) {
    try {
      await this.#js.publish(subject, this.#codec.encode(payload));
    } catch (error) {
      console.log(`Error publishing message of subject ${subject}: `, error);
    }
  }
}
