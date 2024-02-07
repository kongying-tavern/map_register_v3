import type { DBCore, Middleware } from 'dexie'

/**
 * 从 markerVo 中将物品列表单独提取出物品 id 列表，以便数据库依照物品 id 来索引点位
 */
export const markerFormater: Middleware<DBCore> = {
  stack: 'dbcore',
  name: 'marker-formater',
  create: downlevelDB => ({
    ...downlevelDB,
    table: (tableName) => {
      const downlevelTable = downlevelDB.table(tableName)
      if (tableName !== 'marker')
        return downlevelTable
      return {
        ...downlevelTable,
        mutate: (req) => {
          if (req.type === 'add' || req.type === 'put') {
            req.values = req.values.map((markerVo: API.MarkerVo) => ({
              ...markerVo,
              itemIdList: markerVo.itemList?.map(itemVo => itemVo.itemId) ?? [],
            }))
          }
          return downlevelTable.mutate(req)
        },
      }
    },
  }),
}
