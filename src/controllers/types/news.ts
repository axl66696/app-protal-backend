export class userNews {
  /**
   ** 表格名稱：NewsInfo (news info)
  ** 表格說明：最新消息通知資訊
  ** 編訂人員：陳冠守
  ** 校閱人員：孫培然
  ** 設計日期：2023.08.30
  **/

/** 最新消息編號
   * @default crypto.randomUUID()
*/
_id:string = crypto.randomUUID();


/** 消息來源app
  * @default ''
*/
appId: string = '';

/** 使用者代碼
  * @default ''
  * all代表全部使用者
*/
userCode: string[] = [];

/** 消息種類
 * @default ''
*/
newsType: string = '';

/** 最新消息開始日期
   * @default new Date()
*/
newsStartTime: Date = new Date();

/** 最新消息截止日期
 * @default new Date()
*/
newsEndTime: Date = new Date();

/** 最新消息分類
 * @default '未完成'
*/
newsStatus: NewsStatus = "未完成";

/** 最新消息內容
 * @default '''
*/
newsContent: string = '';

/** 外部連結
 * @default '''
*/
newsUrl: string = '';

/** 系統異動人員
  * @default '''
*/
systemUser: string = '';

/** 系統異動時間
  * @default new Date()
*/
systemTime: Date = new Date();

/** 看過時間
* @default new Date()
*/
sawTime: Date = new Date();
}

type NewsStatus = "已完成" | "一般消息" | "未完成";


