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

@Controller("loginInfo")
export class UserController {
  jetStreamService = JetStreamServiceProvider.get();

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

  @Replier("request")
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {

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
