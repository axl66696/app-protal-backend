import { Controller, Replier, Subscriber } from '@his-base/jetstream';
import { OrderService } from '@his-model/nats-oriented-services';
import { Codec, JsMsg, Msg } from 'nats';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService = new OrderService(),
  ) {}

  @Subscriber('create')
  createOrder(message: JsMsg, payload: any) {
    try {
      this.orderService.processMessage(payload);

      message.ack();
    } catch (error) {
      console.log('Error processing order.create: ', error);
      message.nak();
    }
  }

  @Replier('list')
  getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {
    const orders = this.orderService.getAllOrders();

    message.respond(jsonCodec.encode(orders));
  }
}
