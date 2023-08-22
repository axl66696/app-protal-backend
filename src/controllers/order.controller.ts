import { Subscriber, Controller } from '../decorators';
import { OrderService } from '@his-model/nats-oriented-services';
import { JsMsg } from 'nats';

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
}
