import type { DBCore, Middleware } from 'dexie'

/**
 * 数据库操作交由 worker 代理进行
 */
export const workerProxy: Middleware<DBCore> = {
  stack: 'dbcore',
  name: 'worker-proxy',
  create: downlevelDB => ({
    ...downlevelDB,
    transaction: (stores, mode, options) => {
      return downlevelDB.transaction(stores, mode, options)
    },
    table: (tableName) => {
      const downlevelTable = downlevelDB.table(tableName)
      return {
        ...downlevelTable,
        mutate: (req) => {
          // TODO 转发到 worker 进行处理
          return downlevelTable.mutate(req)
        },
      }
    },
  }),
}
