import { markerFormater, workerProxy } from '../middleware'
import { AppDatabase } from './app'

/** 主线程数据库 */
export class MainThreadDB extends AppDatabase {
  constructor() {
    super()
    this
      .use(workerProxy)
      .use(markerFormater)
      .version(this.VERSION)
      .stores({
        area: '&id, parentId, name, code, hiddenFlag',
        iconTag: '&tag, *typeIdList',
        item: '&id, *typeIdList, areaId, name, specialFlag, hiddenFlag',
        itemType: '&id, name, hiddenFlag',
        marker: '&id, *itemIdList, markerTitle, refreshTime, linkageId',
        markerLink: '&id, fromId, toId, linkAction, groupId',
        user: '&id',
        cache: '&id',
        digest: '&code, tableName',
      })
  }
}
