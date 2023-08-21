import { Json } from 'src/types';
import { Consumer, Controller } from '../decorators';

@Controller('order')
export default class OrderController {
  @Consumer('create')
  createOrder(message: Json) {
    console.log('OrderController processing: ', message);
  }
}
