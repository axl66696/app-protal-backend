import { Json } from 'src/types';
import { Consumer, Controller } from '../decorators';
import { OrderService } from './order.service';
import { JsMsg } from 'nats';

@Controller('order')
export default class OrderController {
  constructor(private readonly orderService: OrderService) {
    this.orderService = new OrderService();
  }
  @Consumer('create')
  createOrder(message: JsMsg, payload: Json) {
    try {
      this.orderService.processMessage(payload);

      message.ack();
    } catch (error) {
      console.log('Error processing order.create: ', error);
      message.nak();
    }
  }
}
