import { AppDexie } from './app'

/** 主线程数据库 */
export class MainThreadDB extends AppDexie {
  constructor() {
    super()
    this
      .version(this.VERSION)
      .stores(this.STORES)
  }
}
