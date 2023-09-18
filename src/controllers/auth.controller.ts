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
import { LoginInfo } from "./types/login-info";

@Controller("auth")
export class authController {
  jetStreamService = JetStreamServiceProvider.get();

  mongoDB = new MongoBaseService("mongodb://localhost:27017", "UserDatabase");
  constructor(
    private readonly orderService: OrderService = new OrderService()
  ) {}



  @Replier("request")
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {

    console.log('auth payload',payload)
    const verifiedToken = jwt.verify(payload.token, process.env.saltKey) as LoginInfo;
    console.log('auth verifiedToken',verifiedToken)
    const getUserInfo = await this.mongoDB
      .collections("user")
      .findDocuments({'userCode':verifiedToken.userCode,"passwordHash":verifiedToken.passwordHash,"orgNo":verifiedToken.orgNo});
    // console.log("userInfo", getUserInfo);

    console.log("auth getUserInfo", getUserInfo)
    const userInfo:UserAccount=getUserInfo[0] as unknown as UserAccount
    console.log('auth userInfo', userInfo)
    if(userInfo){
      const returnMessage = {auth:true,userAccount: userInfo as any,}
      message.respond(jsonCodec.encode(returnMessage));
    }
    else{
      const returnMessage = {auth:false,user: {} as any,}
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
