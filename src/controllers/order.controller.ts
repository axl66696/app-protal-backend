import { Subscriber, Controller, Replier } from '../lib/decorators';
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
    this.orderService.processMessage(payload);

    const response = [
      { id: 1, name: 'order1' },
      { id: 2, name: 'order2' },
    ];
    message.respond(jsonCodec.encode(response));
  }
}
