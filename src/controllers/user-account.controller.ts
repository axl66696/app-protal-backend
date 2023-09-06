import {
  Controller,
  JetStreamServiceProvider,
  Replier,
  Subscriber,
} from '@his-base/jetstream';
import { MongoBaseService } from '@his-base/mongo-base';
import { OrderService } from '@his-model/nats-oriented-services';
import { Codec, JsMsg, Msg } from 'nats';
import { UserAccount } from './types/user-account';
@Controller('userAccount')
export class UserAccountController {
  jetStreamService = JetStreamServiceProvider.get();

  mongoDB = new MongoBaseService("mongodb://localhost:27017", "UserDatabase");

  constructor(
    private readonly orderService: OrderService = new OrderService(),
  ) {}

  @Subscriber('update.many')
  updateMany(message: JsMsg, payload: any) {
    try {
      message.ack();
      for (const item of payload){
        const { _id, ...resetUserInfo } = item;
        this.mongoDB.collections("user").collection.updateMany({userCode:item.userCode},{$set:resetUserInfo});
      }
   
    } catch (error) {
      console.error('Error processing order.create: ', error);
      message.nak();
    }
  }

  @Subscriber('update.userFavorite')
  async updateUserFavorite(message: JsMsg, payload: any) {
    try {
      /**payload 排除_id  */
      
      const { _id, ...resetUserInfo } = payload;
      message.ack();
      this.mongoDB.collections("user").collection.updateOne({userCode: payload.userCode}, {$set:resetUserInfo});

    } catch (error) {
      console.error('Error processing order.create: ', error);
      message.nak();
    }
  }


  @Subscriber('update')
  createOrder(message: JsMsg, payload: any) {
    try {

      /**payload 排除_id  */
      const { _id, ...resetUserInfo } = payload;
      message.ack();
      this.mongoDB.collections("user").collection.updateOne({userCode: payload.userCode}, {$set:resetUserInfo});
   
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
  async getAllUser(message: Msg, payload: any, jsonCodec: Codec<any>) {
    const getUsersInfo = await this.mongoDB.collections("user").findDocuments({})
    console.log("==================================")
    console.log(getUsersInfo);

    message.respond(jsonCodec.encode(getUsersInfo));
  }
}
