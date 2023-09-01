import {
  Controller,
  JetStreamServiceProvider,
  Replier,
  Subscriber,
} from '@his-base/jetstream';
import { MongoBaseService } from '@his-base/mongo-base';
import { OrderService } from '@his-model/nats-oriented-services';
import { Codec, JsMsg, Msg } from 'nats';
@Controller('userAccount')
export class UserAccountController {
  jetStreamService = JetStreamServiceProvider.get();

  mongoDB = new MongoBaseService("mongodb://localhost:27017", "UserDatabase");

  constructor(
    private readonly orderService: OrderService = new OrderService(),
  ) {}

  @Subscriber('update')
  createOrder(message: JsMsg, payload: any) {
    try {

      const { _id, ...ResetData } = payload;

      message.ack();
      this.mongoDB.collections("user").collection.updateOne({userCode: payload.userCode}, {$set:ResetData});
   
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
    const orders = await this.orderService.getAllOrders();

    console.log(orders);

    message.respond(jsonCodec.encode(orders));
  }
}
