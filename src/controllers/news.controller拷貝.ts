import {
  Controller,
  JetStreamServiceProvider,
  Replier,
  Subscriber,
} from "@his-base/jetstream";
import { MongoBaseService } from "@his-base/mongo-base";
import { OrderService } from "@his-model/nats-oriented-services";
import { Codec, JsMsg, Msg } from "nats";

@Controller("userNews")
export class NewsController {
  jetStreamService = JetStreamServiceProvider.get();

  mongoDB = new MongoBaseService("mongodb://localhost:27017", "UserDatabase");

  constructor(
    private readonly orderService: OrderService = new OrderService()
  ) {}

  @Subscriber("postNews")
  newCreateOrder(message: JsMsg, payload: any) {
    try {
      this.orderService.processMessage(payload);

      message.ack();
      // this.jetStreamService.publish('user.list', 'Hello Againmnlnmlknlk');
      // this.jetStreamService.publish(
      //   "userNews.ok",
      //   '{"id":0001,"news":"eflaiujbsflcuhwealuyhcl"}'
      // );

      // 插入資料
      // this.mongoDB.collections("news").insertDocuments({
      //   id: '0001',
      //   news: 'eflaiujbsflcuhwealuyhcl'
      // });
      const breakingNews = this.mongoDB
        .collections("news")
        .findDocuments({})
        .then((x) => {
          console.log(x);
          //  這裡拿到mongoDB資料之後要去publish給前端sub做畫面顯示用
          this.jetStreamService.publish('userNews.getNews', x);
        });
      console.log(breakingNews);

      // setTimeout(() => {
      //   this.jetStreamService.publish('order.create', 'Hello Again');
      // }, 2000);
    } catch (error) {
      console.error("Error processing order.create: ", error);
      message.nak();
    }
  }

  @Subscriber("create")
  createOrder(message: JsMsg, payload: any) {
    try {
      this.orderService.processMessage(payload);

      message.ack();

      setTimeout(() => {
        this.jetStreamService.publish("order.create", "Hello Again");
      }, 2000);
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

  @Replier("list")
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {
    const orders = await this.orderService.getAllOrders();

    console.log(orders);

    message.respond(jsonCodec.encode(orders));
  }
}
