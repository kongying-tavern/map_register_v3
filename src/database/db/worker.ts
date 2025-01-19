import { AppDatabase } from './app'

/** worker 线程数据库 */
export class WorkerThreadDB extends AppDatabase {
  constructor() {
    super()
    this
      .version(this.VERSION)
      .stores(this.STORES)
  }
}
