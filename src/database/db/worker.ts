import { markerFormater } from '../middleware/markerFormater'
import { AppDatabase } from './app'

/** worker 线程数据库 */
export class WorkerThreadDB extends AppDatabase {
  constructor() {
    super()
    this
      .use(markerFormater)
      .version(this.VERSION)
      .stores({
        area: '&id, parentId, name, code, hiddenFlag',
        iconTag: '&tag, *typeIdList',
        item: '&id, *typeIdList, areaId, name, specialFlag, hiddenFlag',
        itemType: '&id, name, hiddenFlag',
        marker: '&id, *itemIdList, markerTitle, refreshTime, linkageId',
        markerLink: '&id, fromId, toId, linkAction, groupId',
        user: 'id',
        userArchive: 'id',
        cache: '&id',
        digest: '&code, tableName',
      })
  }
}
