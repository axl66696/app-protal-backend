import {
  Codec,
  JSONCodec,
  JetStreamClient,
  JsMsg,
  NatsConnection,
  connect,
} from 'nats';

export class NatsJetStreamServer {
  #nc: NatsConnection;
  #js!: JetStreamClient;
  #streamName = 'OPD';
  #codec: Codec<any> = JSONCodec();

  async connect() {
    if (this.#nc) return;

    this.#nc = await connect({ servers: 'localhost:4222' });
    this.#js = this.#nc.jetstream();
  }

  async subscribe(
    name: string,
    callback: (message: JsMsg, payload: any) => void,
  ) {
    const consumer = await this.#js.consumers.get(this.#streamName, name);
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
