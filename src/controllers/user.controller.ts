import {
  Controller,
  JetStreamServiceProvider,
  Replier,
  Subscriber,
} from "@his-base/jetstream";
import {} from "module";
import { MongoBaseService } from "@his-base/mongo-base";
import { OrderService } from "@his-model/nats-oriented-services";
import { Codec, JsMsg, Msg } from "nats";
import { ConsumerOptsBuilderImpl } from "nats/lib/jetstream/types";

@Controller("user")
export class UserController {
  jetStreamService = JetStreamServiceProvider.get();

// const mongoose = require('mongoose');

// const DataSchema = new this.mongoose.Schema({
//   orgNo: String,
//   userCode: String,
//   userName: String,
//   sex: String,
//   birthday: Date,
//   userImage: String || null,
//   eMail: String || null,
//   passwordHash: String,
//   passwordDate: Date,
//   authHash: String,
//   startDate: Date,
// });



  mongoDB = new MongoBaseService("mongodb://localhost:27017", "users");
  constructor(
    private readonly orderService: OrderService = new OrderService()
  ) {}

  @Subscriber("login")
  createOrder(message: JsMsg, payload: any) {
    try {
      this.orderService.processMessage(payload);

      message.ack();
      this.jetStreamService.publish("user.ok", "Hello Againmnlnmlknlk");

      // setTimeout(() => {
      //   this.jetStreamService.publish('order.create', 'Hello Again');
      // }, 2000);
    } catch (error) {
      console.error("Error processing order.create: ", error);
      message.nak();
    }
  }

  @Subscriber("*.*.update")
  updateOrder(message: JsMsg, payload: any) {
    try {
      console.log("Processing time update", payload);

      message.ack();
    } catch (error) {
      console.error("Error processing order.*.*.update: ", error);
      message.nak();
    }
  }

  @Replier("login")
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {
    // const orders = await this.orderService.getAllOrders();

    // console.log(orders);

    // message.respond(jsonCodec.encode(orders));

    //修改這邊，抓到資料酷的資料核對使用者orgNo、userName、passwordHash

    //比對的資料是否符合message，如果符合則回傳true，否則回傳false
    // const user = await this.mongoDB.collections("users").findDocuments({message});

    // console.log("payload", payload);
    // console.log(await this.mongoDB.collections("users").findDocuments({}));

    const userInfo = await this.mongoDB
      .collections("users")
      .findDocuments({'userCode':'001-userCode'});
    console.log("userInfo", userInfo);
    // 如果payload.userName存在his.mongoDB.collections("users")中，則回傳true，否則回傳false
    if(payload.userCode  ){
      return {
        auth: true,
        user: {} as any,
      };
    }else{
      return {
        auth: false,
      };
    }
    const returnMessage = {
      auth: true,
      user: {} as any,
    };
    console.log("returnMessage", returnMessage);
    message.respond(jsonCodec.encode(returnMessage));
  }
}
