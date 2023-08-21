import { Injectable } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import {
  Codec,
  JSONCodec,
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
  connect,
} from 'nats';
import { NatsJetStreamServerOptions } from './jetstream.interface';
import { Json } from 'src/types';

@Injectable()
export class NatsJetStreamServer
  extends Server
  implements CustomTransportStrategy
{
  #nc: NatsConnection;
  #codec: Codec<Json> = JSONCodec();
  #jsm!: JetStreamManager;
  #js!: JetStreamClient;
  options!: NatsJetStreamServerOptions;

  // 監聽
  async listen(callback: () => void) {
    await this.connect();
    callback();
  }

  async connect() {
    if (!this.#nc) {
      this.#nc = await connect(this.options.connectionOptions);
      if (this.options.connectionOptions.connectedHook) {
        this.options.connectionOptions.connectedHook(this.#nc);
      }
      this.#jsm = await this.#nc.jetstreamManager();
      this.#js = this.#nc.jetstream();
    }
  }

  async subscribeMessage(
    stream: string,
    name: string,
    callback: (payload: Json) => void,
  ) {
    const consumer = await this.#js.consumers.get(stream, name);
    const messages = await consumer.consume();
    for await (const message of messages) {
      try {
        const payload = this.#codec.decode(message.data);
        console.log(payload);
        console.log(`consumer fetch: ${message.subject}`);
        const ackStatus = await message.ackAck();

        if (ackStatus) {
          callback(payload);
        } else {
          message.nak();
        }
      } catch (error) {
        console.error(error);
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
      console.log('發送成功');
    } catch (err) {
      console.log('發送失敗');
    }
  }
}
