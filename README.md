# nats-oriented-backend

用於啟動後端 server 的 package，內含 NATS + MongoDB

- 本地運行
- 配置檔設定 .env
- Controller 設定 controller.ts
- 引入 jetStreamService controller.ts
- 訂閱者設定 controller.ts
- Reply 設定 controller.ts

以下為程式使用範例

## 本地運行

複製本專案

```bash
  git clone https://link-to-project
```

移動至指定資料夾

```bash
  cd nats-oriented-backend
```

安裝依賴項

```bash
  npm install
```

啟動伺服

```bash
  npm run start
```

## 配置檔設定 .env

新增一個 .env 檔案，用於本機端設定

```env
NATS_SERVERS='localhost:4222'
NATS_STREAM='OPD'
NATS_USER=''
NATS_PASS=''

MONGODB_URL='mongodb://localhost:27017'
MONGODB_DATABASE='OPD'
```

## Controller 設定 controller.ts

Controller 為 consumer name  
也同樣是 subject 的開頭，如 order.create

```typescript
@Controller('order')
export class OrderController {}
```

## Controller 引入 Services

```typescript
@Controller('order')
export class OrderController {
  // 單實體引入方式
  jetStreamService = JetStreamServiceProvider.get();
  mongoService = MongoServiceProvider.get();

  // 商業邏輯需放在額外的 service 做動態載入
  constructor(
    private readonly orderService: OrderService = new OrderService(),
  ) {}
}
```

## 訂閱者設定 controller.ts

subscriber 為訂閱的主題，如 order.create、order.create.new  
直接將 .加在後面即可使用 @Subscriber('create.new')

```typescript
  @Subscriber('create')

  // message 為訂閱nats接收到的訊息
  // payload 為publish傳遞過來的資料
  createOrder(message: JsMsg, payload: any) {
    try {
      // 商業邏輯的部分
      this.orderService.processMessage(payload);

      // 處理完成回傳Ack
      message.ack();

      // 訂閱完後要publish到下個主題
      // 需帶入subject、payload
      setTimeout(() => {
        this.jetStreamService.publish('order.update', 'Hello');
      }, 2000);
    } catch (error) {
      console.log('Error processing order.create: ', error);

      // 訊息處理失敗，請再重新傳送一次
      // nak()可填入延遲傳遞時間，單位 ms
      message.nak();
    }
  }
```

## Reply 設定 controller.ts

Replier 為給 Reply 使用的主題，如 order.list、order.list.new  
直接將 .加在後面即可使用 @Replier('list.new')

```typescript
  @Replier('list')

  // message 為訂閱nats接收到的訊息
  // payload 為request傳遞過來的資料
  // jsonCodec 為處理資料編碼做使用
  async getOrders(message: Msg, payload: any, jsonCodec: Codec<any>) {
    const orders = await this.orderService.getAllOrders();

    console.log(orders);

    // 處理完成將資料編碼並回覆
    message.respond(jsonCodec.encode(orders));
  }
```

## 製作 Service（加上 MongoDB）

製作 Service

```javascript
export class PatientService {
  // 也可進行單實體引入
  mongoService = MongoServiceProvider.get();

  // 商業邏輯們
  async getPatients() {
    const patients = this.mongoService.collections('patient').findDocuments({});

    return patients;
  }
}

// 需要做單實體使用時可做成一個Provider，並在main.ts中的NatsServer.#initializa中執行初始化
export class PatientServiceProvider {
  static #instance: PatientService;

  // Service初始化設定
  async initialize() {
    PatientServiceProvider.#instance = await (/* 初始化 */)
  }

  // 回傳單實體
  static get() {
    return PatientServiceProvider.#instance;
  }
}
```

## 安裝 Service

安裝 Service

```bash
  npm install @his-model/nats-oriented-services
```
