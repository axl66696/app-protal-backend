import { AppStoreService } from '../app-store/app-store.service';
import {
  Controller,
  Replier,
  Subscriber,
} from '@his-base/jetstream';
import { Codec, JsMsg, Msg } from 'nats';


@Controller('appStore')
export class appStoreController { 
  constructor(private readonly appStoreService:AppStoreService = new AppStoreService()
  ) {}

  // 新增資料
  @Subscriber('insert')
  async create(message: JsMsg, payload: any) {
    this.appStoreService.create(message,payload)
  }

  // 更新資料
  @Subscriber('update')
  async update(message: JsMsg, payload: any) {
    this.appStoreService.update(message,payload)
  }

  // 刪除資料
  @Subscriber('delete')
  async delete(message: JsMsg, payload: any) {
    this.appStoreService.delete(message,payload)
  }

  // 拿到所有資料
  @Replier('list')
  async getList(message: Msg, payload: any, jsonCodec: Codec<any>) {
   this.appStoreService.getList(message,payload,jsonCodec)
  }

  // 拿到特定資料
  @Replier('search')
  async search(message: Msg, payload: any, jsonCodec: Codec<any>) {
   this.appStoreService.search(message,payload,jsonCodec)
  }

  // 拿到特定資料
  @Replier('get')
  async get(message: Msg, payload: any, jsonCodec: Codec<any>) {
   this.appStoreService.get(message,payload,jsonCodec)
  }
}
