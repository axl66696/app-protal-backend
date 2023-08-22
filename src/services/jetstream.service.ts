import {
  Codec,
  JSONCodec,
  JetStreamClient,
  JsMsg,
  NatsConnection,
  connect,
} from 'nats';
import { NatsServerConfig } from 'src/interface';

export class NatsJetStreamServer {
  #nc: NatsConnection;
  #js!: JetStreamClient;
  #codec: Codec<any> = JSONCodec();

  constructor(private readonly serverConfig: NatsServerConfig) {}

  async connect() {
    if (this.#nc) return;

    this.#nc = await connect({ servers: this.serverConfig.servers });
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

  async publish(subject: string, payload: any) {
    try {
      await this.#js.publish(subject, this.#codec.encode(payload));
    } catch (error) {
      console.log(`Error publishing message of subject ${subject}: `, error);
    }
  }
}
