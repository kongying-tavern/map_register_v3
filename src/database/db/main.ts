import { AppDatabase } from './app'

/** 主线程数据库 */
export class MainThreadDB extends AppDatabase {
  constructor() {
    super()
    this
      .version(this.VERSION)
      .stores(this.STORES)
  }
}
