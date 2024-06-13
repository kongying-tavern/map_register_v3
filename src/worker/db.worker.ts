import type {
  DBCoreAddRequest,
  DBCoreMutateResponse,
  DBCorePutRequest,
} from 'dexie'
import { WorkerThreadDB } from '@/database/db/worker'
import { useLoggerWorker } from '@/hooks/useWorkerLogger'

declare const globalThis: DedicatedWorkerGlobalScope

type MutateRequestOptions<T> = {
  tableName: string
} & T

export type WorkerInput = MutateRequestOptions<
  | Pick<DBCoreAddRequest, 'type' | 'values'>
  | Pick<DBCorePutRequest, 'type' | 'values'>
>

export type WorkerSuccessOutput = DBCoreMutateResponse

/** 主线程接收数据 */
export type WorkerOutput =
  | string // 错误原因
  | WorkerSuccessOutput

const db = new WorkerThreadDB()

const mutate = async (ev: MessageEvent<WorkerInput>): Promise<DBCoreMutateResponse> => {
  const { data } = ev

  switch (data.type) {
    case 'add':
      await db.table(data.tableName).bulkAdd(data.values)
      break
    case 'put':
      await db.table(data.tableName).bulkPut(data.values)
      break
    default:
      throw new Error(`无法处理的操作类型`)
  }

  return {
    failures: [],
    lastResult: undefined,
    numFailures: 0,
    results: [],
  }
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  const { send, logger } = useLoggerWorker<WorkerInput, WorkerOutput>(ev, '数据库代理')

  const { tableName, type, values } = ev.data

  try {
    const now = Date.now()
    const res = await mutate(ev)
    logger.info(`代理表 ${tableName} 的 ${type} 操作成功，共 ${values.length} 条数据，耗时 ${Date.now() - now} ms`)
    send(res)
  }
  catch (err) {
    logger.error(`代理表 ${tableName} 的 ${type} 操作失败，原因为：${err instanceof Error ? err.message : `${err}`}`)
    send(err instanceof Error ? err.message : `${err}`)
  }
})
