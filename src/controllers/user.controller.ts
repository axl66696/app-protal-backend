import {
  Controller,
  JetStreamServiceProvider,
  Replier,
  Subscriber,
} from '@his-base/jetstream';
import { OrderService } from '@his-model/nats-oriented-services';
import { Codec, JsMsg, Msg } from 'nats';

@Controller('user')
export class UserController {
  jetStreamService = JetStreamServiceProvider.get();

  constructor(
    private readonly orderService: OrderService = new OrderService(),
  ) {}

  @Subscriber('login')
  createOrder(message: JsMsg, payload: any) {
    try {
      this.orderService.processMessage(payload);

      message.ack();
      this.jetStreamService.publish('user.ok', 'Hello Againmnlnmlknlk');

      // setTimeout(() => {
      //   this.jetStreamService.publish('order.create', 'Hello Again');
      // }, 2000);
    } catch (error) {
      console.error('Error processing order.create: ', error);
      message.nak();
    }
  }

  @Subscriber('*.*.update')
  updateOrder(message: JsMsg, payload: any) {
    try {
      console.log('Processing time update', payload);

      message.ack();
    } catch (error) {
      console.error('Error processing order.*.*.update: ', error);
      message.nak();
    }
  }

  @Replier('list')
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {
    // const orders = await this.orderService.getAllOrders();

    // console.log(orders);

    // message.respond(jsonCodec.encode(orders));
    
    const returnMessage = {
      auth: true,
      user:{} as any,
      }
      console.log('returnMessage', returnMessage);
    message.respond(jsonCodec.encode(returnMessage));
  }
}
