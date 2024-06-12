import type {
  DBCoreAddRequest,
  DBCoreMutateResponse,
  DBCorePutRequest,
} from 'dexie'
import { WorkerThreadDB } from '@/database/db/worker'
import { useLoggerWorker } from '@/hooks/useWorkerLogger'
import type { Logger } from '@/utils/logger'

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

const mutate = async (ev: MessageEvent<WorkerInput>, logger: Logger): Promise<DBCoreMutateResponse> => {
  const { data } = ev

  logger.info(`正在代理表 ${data.tableName} 的 ${data.type} 操作, 数据长度: ${data.values.length}`)

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

  try {
    const res = await mutate(ev, logger)
    send(res)
  }
  catch (err) {
    logger.error(err instanceof Error ? err.message : `${err}`)
    send(err instanceof Error ? err.message : `${err}`)
  }
})
