/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDatabase } from './appdatabase'

const db = new AppDatabase()

/** 数据库批量设置线程 */
self.onmessage = async (ev: MessageEvent<{ table: string; data: any[] }>) => {
  const { table, data } = ev.data
  await db.table(table).bulkPut(data)
  ev.ports[0].postMessage('')
}
