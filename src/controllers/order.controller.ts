import {
  Controller,
  JetStreamService,
  Replier,
  Subscriber,
} from '@his-base/jetstream';
import { MongoBaseService } from '@his-base/mongo-base';
import { OrderService } from '@his-model/nats-oriented-services';
import { Codec, JsMsg, Msg } from 'nats';

@Controller('order')
export class OrderController {
  mongoService: MongoBaseService;
  jetStreamService: JetStreamService;

  constructor(
    private readonly orderService: OrderService = new OrderService(),
  ) {}

  @Subscriber('create')
  createOrder(message: JsMsg, payload: any) {
    try {
      this.orderService.processMessage(payload);

      message.ack();

      setTimeout(() => {
        this.jetStreamService.publish('order.create', 'Hello Again');
      }, 2000);
    } catch (error) {
      console.log('Error processing order.create: ', error);
      message.nak();
    }
  }

  @Replier('list')
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {
    const orders = await this.orderService.getAllOrders();

    console.log(orders);

    message.respond(jsonCodec.encode(orders));
  }
}
