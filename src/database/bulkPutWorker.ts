import { AppDatabase } from './appdatabase'
import { messageFrom } from '@/utils/messageFrom'

export {}
declare const globalThis: DedicatedWorkerGlobalScope

const db = new AppDatabase()

/** 数据库批量更新线程 */
globalThis.addEventListener('message', async (ev: MessageEvent<{ table: string; data: unknown[] }>) => {
  try {
    const { table, data } = ev.data
    await db.table(table).bulkPut(data)
    ev.ports[0].postMessage('')
  }
  catch (err) {
    ev.ports[0].postMessage(messageFrom(err))
  }
})
