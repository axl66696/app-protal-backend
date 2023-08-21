import { Json } from 'src/types';
import { Consumer, Controller } from '../decorators';
import { OrderService } from './order.service';

@Controller('order')
export default class OrderController {
  constructor(private readonly orderService: OrderService) {
    this.orderService = new OrderService();
  }
  @Consumer('create')
  createOrder(message: Json) {
    this.orderService.processMessage(message);
  }
}
