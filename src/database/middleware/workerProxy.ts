import type {
  DBCore,
  DBCoreAddRequest,
  DBCoreMutateRequest,
  DBCoreMutateResponse,
  DBCorePutRequest,
  DBCoreTable,
  Middleware,
} from 'dexie'
import { createWorkerHelper } from '@/utils'
import Worker from '@/worker/db.worker?worker'
import type { WorkerInput, WorkerOutput } from '@/worker/db.worker'

const send = createWorkerHelper<WorkerInput, WorkerOutput>(new Worker({ name: '数据库代理线程' }))

const collectTransferable = (value: unknown, transferable: Transferable[] = []) => {
  if (!value || typeof value !== 'object')
    return
  if (value instanceof ArrayBuffer)
    return transferable.push(value)
  if (ArrayBuffer.isView(value))
    return transferable.push(value.buffer)
  if (Array.isArray(value))
    return value.forEach(item => collectTransferable(item, transferable))
}

const handlerAdd = async (req: DBCoreAddRequest, table: DBCoreTable): Promise<DBCoreMutateResponse> => {
  const defaultRes = {
    failures: {},
    lastResult: undefined,
    numFailures: 0,
    results: [],
  }

  if (!req.values.length)
    return defaultRes

  return table.mutate(req)
}

const handlerPut = async (req: DBCorePutRequest, table: DBCoreTable): Promise<DBCoreMutateResponse> => {
  const defaultRes = {
    failures: {},
    lastResult: undefined,
    numFailures: 0,
    results: [],
  }

  if (!req.values.length)
    return defaultRes

  const transferable: Transferable[] = []
  collectTransferable(req.values, transferable)

  const res = await send({
    tableName: table.name,
    type: 'put',
    values: req.values,
  }, transferable)

  if (typeof res === 'string') {
    const error = new Error(res)
    defaultRes.failures = req.values.map(() => error)
    defaultRes.numFailures = req.values.length
  }

  return defaultRes
}

/**
 * @todo 转发到 worker 进行处理
 */
const workerMutate = (req: DBCoreMutateRequest, table: DBCoreTable): Promise<DBCoreMutateResponse> => {
  // 目前性能瓶颈主要是添加和修改，暂且只代理这两种操作
  switch (req.type) {
    case 'add':
      return handlerAdd(req, table)
    case 'put':
      return handlerPut(req, table)
    default:
      return Promise.resolve<DBCoreMutateResponse>({
        failures: {},
        lastResult: undefined,
        numFailures: 0,
        results: [],
      })
  }
}

/**
 * 数据库操作交由 worker 代理进行
 */
export const workerProxy: Middleware<DBCore> = {
  stack: 'dbcore',
  name: 'worker-proxy',
  create: core => ({
    ...core,
    table: (tableName) => {
      const downlevelTable = core.table(tableName)
      return {
        ...downlevelTable,
        mutate: req => workerMutate(req, downlevelTable),
      }
    },
  }),
}
