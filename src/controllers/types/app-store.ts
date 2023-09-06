import { Coding } from '@his-base/datatypes/dist/datatypes';
import { AppPage } from "@his-viewmodel/app-page-editor";

/**
 ** 表格名稱：AppStore (Appstore Record)
 ** 表格說明：appProtal 紀錄應用程式詳細資料
 ** 編訂人員：陳冠守
 ** 校閱人員：孫培然
 ** 設計日期：2023.08.30
 **/

export class AppStore {

  /** 系統程式編號
     * @default crypto.randomUUID()
   */
  _id: string = crypto.randomUUID();

  /** 應用程式名稱
   * @default ''
  */
  appTitle: string = '';

  /** 應用程式版本
   * @default ''
  */
  versionNo: string = '';

  /** 應用程式類別
   * @default ''
  */
  appType: string = '';

  /** 應用程式網址路徑
   * @default ''
  */
  appUrl: string = '';

  /** 應用程式首頁
   * @default new Coding()
  */
  appHome: Coding = new Coding();

  /** 應用程式撰寫語言
   * @default ''
  */
  appLanguage: string = '';

  /** 應用程式圖標
   *  @default ''
  */
  appIcon: string = '';

  /** 應用程式授權與否
   * @default false
  */
  isAuth: boolean = false;

  /** 應用程式授權人員
   * @default new Coding()
  */
  userAuth: Coding = new Coding();

  /**  */
  moduleName: string = '';

  appPages: AppPage[] = [];

  /** 是否加到我的最愛
   * @default false
  */
  isFavorite: boolean = false;

  /** 是否打開應用程式
   * @default false
  */
  isOpen: boolean = false;

  constructor(that?: Partial<AppStore>) {
    Object.assign(this, structuredClone(that));
  }
}

