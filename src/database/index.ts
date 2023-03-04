import { Dexie } from 'dexie'
import { markerFormater } from './middleware'

/** MD5 表 */
export interface MD5Vo {
  /** 点位 id 为 marker-0、marker-1，物品 id 为 item-0，以此类推 */
  id: string
  value: string
}

class AppDatabase extends Dexie {
  /** 点位表 */
  declare marker: Dexie.Table<API.MarkerVo, number>
  /** 物品表 */
  declare item: Dexie.Table<API.ItemVo, number>
  /** MD5 记录表 */
  declare md5: Dexie.Table<MD5Vo, string>

  constructor() {
    super('AppDatabase')
    // 只列出需要被索引的键
    this.version(1.2).stores({
      marker: '&id, *itemIdList, markerTitle, markerCreatorId, pictureCreatorId, videoPath, refreshTime, hiddenFlag',
      item: '&itemId, *typeIdList, areaId, name, specialFlag, hiddenFlag',
      md5: '&id',
    })
    this.use(markerFormater)
  }
}

const db = new AppDatabase()

export default db
