import {
  Controller,
  JetStreamServiceProvider,
  Replier,
  Subscriber,
} from "@his-base/jetstream";
import nodemailer from 'nodemailer';
import fs from 'fs'
import { MongoBaseService } from "@his-base/mongo-base";
import { Codec, JsMsg, Msg } from "nats";
import { UserAccount } from "./types/user-account";
import jwt from 'jsonwebtoken';


@Controller("forgetPasswordUser")
export class forgetPasswordUserController {
  jetStreamService = JetStreamServiceProvider.get();

  mongoDB = new MongoBaseService("mongodb://localhost:27017", "UserDatabase");
  constructor(
  ) {
  }

  //處理前端申請忘記密碼
  @Subscriber("apply")
  async getOrders( message: JsMsg, payload: any) {
    console.log(payload.userCode)
    const getUserInfo = await this.mongoDB
      .collections("user")
      .findDocuments({'userCode':payload.userCode,'eMail':payload.eMail});
    const userInfo:UserAccount=getUserInfo[0] as unknown as UserAccount
    console.log(getUserInfo)

    if(getUserInfo){
      message.ack()
      const transporter = nodemailer.createTransport({
              service: 'Gmail', // 例如，'Gmail' 或 'SMTP'
        auth: {
          user: 'h34076144@gs.ncku.edu.tw', // 你的電子郵件地址
          pass: 'mmhz nyso oizj goxs'     // 你的電子郵件密碼
        }})
        const secret = process.env.saltKey;
        const emailTemplate = fs.readFileSync('./src/email-template/email-template.html', 'utf-8');
        const userName = userInfo.userCode
        const token = jwt.sign(userInfo, secret, { expiresIn: '30d', algorithm: 'HS256' });
        const mailOptions = {
          from: 'h34076144@gs.ncku.edu.tw',
          to: 'firstblood0904@gmail.com',
          subject: '忘記密碼通知',
          html: emailTemplate.replace('{{ username }}', userName).replace('{{ token }}', 'http://localhost:10000/login/'+token)
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
    }
    else{
      message.nak()
    }
  }

  //授權進入修改密碼的畫面
  @Replier("auth")
  async auth(message: Msg, payload: any, jsonCodec: Codec<any>) {
    try{
      const verifiedToken = jwt.verify(payload, process.env.saltKey) as UserAccount;  
      console.log(verifiedToken)
      const getUserInfo = await this.mongoDB
      .collections("user")
      .findDocuments({'userCode':verifiedToken.userCode,"passwordHash":verifiedToken.passwordHash});
      const userInfo:UserAccount=getUserInfo[0] as unknown as UserAccount
      console.log(userInfo)
      if(userInfo){
        const returnMessage = {auth:true,userAccount: userInfo as UserAccount}
        message.respond(jsonCodec.encode(returnMessage));
      }
      else{
        const returnMessage = {auth:false,userAccount: "no user" as any}
        message.respond(jsonCodec.encode(returnMessage));
      }
  }
  catch(error){
    const returnMessage = {auth:false,userAccount: "invalid url" as any}
    message.respond(jsonCodec.encode(returnMessage));
  }
  }

  // @Subscriber("update")
  // async update(message: JsMsg, payload: any){
  //   try {

  //     /**payload 排除_id  */
  //     const { _id, ...resetUserInfo } = payload;
  //     message.ack();
  //     this.mongoDB.collections("user").collection.updateOne({userCode: payload.userCode}, {$set:{passwordHash:resetUserInfo.passwordHash}});
   
  //   } catch (error) {
  //     console.error('Error processing order.create: ', error);
  //     message.nak();
  //   }
  // }
}
