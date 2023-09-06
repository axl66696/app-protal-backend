export class LoginInfo {

  /**
 ** 表格名稱：LoginInfo (login info)
 ** 表格說明：登入資訊
 ** 編訂人員：陳冠守
 ** 校閱人員：孫培然
 ** 設計日期：2023.08.30
 **/

  /** 機構代碼
  * @default '''
  */
  orgNo: string = '';

  /** 使用者代碼
   * @default ''
  */
  userCode: string = '';

  /** 密碼雜湊
   * @default ''
  */
  passwordHash: string = '';

  constructor(that?: Partial<LoginInfo>) {
    Object.assign(this, structuredClone(that));
  }
}


