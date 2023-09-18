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
import { UserAccount } from "./types/user-account";
import jwt from 'jsonwebtoken';


@Controller("loginInfo")
export class LoginInfoController {
  jetStreamService = JetStreamServiceProvider.get();

  mongoDB = new MongoBaseService("mongodb://localhost:27017", "UserDatabase");
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
    console.log(process.env.saltKey)
    const getUserInfo = await this.mongoDB
      .collections("user")
      .findDocuments({'userCode':payload.userCode,"passwordHash":payload.passwordHash,"orgNo":payload.orgNo});
    // console.log("userInfo", getUserInfo);
    console.log("userCode", payload.userCode)
    const userInfo:UserAccount=getUserInfo[0] as unknown as UserAccount

    if(userInfo){
      const secret = process.env.saltKey;
      const token= jwt.sign(payload, secret, { expiresIn: '30d', algorithm: 'HS256' });
      const returnMessage = {auth:true,userAccount: userInfo as UserAccount,token:token}
      message.respond(jsonCodec.encode(returnMessage));
    }
    else{
      const returnMessage = {auth:false,user: "no user" as any}
      message.respond(jsonCodec.encode(returnMessage));
    }

    // 如果payload.userName存在his.mongoDB.collections("users")中，則回傳true，否則回傳false

    
    // const returnMessage = {
    //   auth: true,
    //   user: {} as any,
    // };
    // console.log("returnMessage", returnMessage);
    // message.respond(jsonCodec.encode(returnMessage));
  }
}
