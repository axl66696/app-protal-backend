import {
  Codec,
  JSONCodec,
  JetStreamClient,
  JsMsg,
  Msg,
  NatsConnection,
  connect,
} from 'nats';
import { NatsServerConfig } from 'src/lib/interface';

export class NatsJetStreamServer {
  #nc: NatsConnection;
  #js!: JetStreamClient;
  #jsonCodec: Codec<any> = JSONCodec();

  constructor(private readonly serverConfig: NatsServerConfig) {}

  async connect() {
    if (this.#nc) return;

    this.#nc = await connect(this.serverConfig);
    this.#js = this.#nc.jetstream();
  }

  async subscribe(
    name: string,
    callback: (message: JsMsg, payload: any) => void,
  ) {
    const consumer = await this.#js.consumers.get(
      this.serverConfig.stream,
      name,
    );
    const messages = await consumer.consume();

    for await (const message of messages) {
      try {
        const payload = this.#jsonCodec.decode(message.data);
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

  async publish(subject: string, payload: any) {
    try {
      await this.#js.publish(subject, this.#jsonCodec.encode(payload));
    } catch (error) {
      console.log(`Error publishing message of subject ${subject}: `, error);
    }
  }

  reply(
    subject: string,
    callback: (message: Msg, payload: any, jsonCodec: Codec<any>) => void,
  ) {
    this.#nc.subscribe(subject, {
      callback: (_err, message) => {
        const payload = this.#jsonCodec.decode(message.data);
        console.log(`Got request from subject ${message.subject}: ${payload}`);

        callback(message, payload, this.#jsonCodec);
      },
    });
  }
}
