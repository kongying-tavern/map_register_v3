import { WorkerThreadDB } from '@/database/db/worker'

declare const globalThis: DedicatedWorkerGlobalScope

const db = new WorkerThreadDB()

export interface WorkerInput {
  tableName: string
  data: unknown[]
}

export interface WorkerOutput {
  error?: boolean
  message: string
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  try {
    const { tableName, data } = ev.data
    const table = db.table(tableName)
    await db.transaction('rw!', table, async () => {
      await table.clear()
      await table.bulkPut(data)
    })
    globalThis.postMessage({
      message: 'success',
    } as WorkerOutput)
  }
  catch (err) {
    globalThis.postMessage({
      error: true,
      message: err instanceof Error ? err.message : `${err}`,
    } as WorkerOutput)
  }
})
