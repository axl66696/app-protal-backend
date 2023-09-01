export class UserAccount {


  /**
    ** 表格名稱：LoginInfo (login info)
    ** 表格說明：登入資訊
    ** 編訂人員：吳佩穎
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

  /** 使用者姓名
   * @default ''
  */
  userName: string = '';

  /** 性別
   *  @default ''
  */
  sex: string = '';

  /** 出生日期
   * @default null
  */
  birthday: Date | null = null;

  /** 使用者相片
   * @default null
  */
  userImage: string | null = null;

  /** 電子信箱
   *  @default null
  */
  eMail: string | null = null;

  /** 密碼雜湊
   * @default ''
  */
  passwordHash: string = '';

  /** 密碼過期日期
   * @default new Date()
  */
  passwordDate: Date = new Date();

  /** 授權雜湊
   * @default ''
  */
  authHash: string = '';

  /** 開始日期
   * @default new Date()
  */
  startDate: Date = new Date();

  /** 停用日期
   *  @default new Date()
  */
  endDate: Date = new Date();

  /** 備註說明
   * @default null
  */
  remark: string | null = null;

  /** 系統異動人員
   * @default '''
  */
  systemUser: string = '';

  /** 系統異動時間
   * @default new Date()
  */
  systemTime: Date = new Date();

  /** 個人風格設置
   * @default {}
  */
  typeSetting: object = {};

  /** 系統權限
   * @default []
  */
  systemAuthority: string[] = [];

  /** 使用者系統我的最愛
   * @default []
  */
  userFavorite: string[] = [];

  constructor(that?: Partial<UserAccount>) {
    Object.assign(this, structuredClone(that));
  }
}
