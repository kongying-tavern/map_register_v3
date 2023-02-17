import { Dexie } from 'dexie'

class AppDatabase extends Dexie {
  /** 点位表 */
  marker!: Dexie.Table<API.MarkerVo, number>
  /** 点位分片数据的 MD5 记录表 */
  markerMD5!: Dexie.Table<{ index: number; md5: string }, number>

  constructor() {
    super('AppDatabase')
    // 只列出需要被索引的键
    this.version(1).stores({
      marker: '&id, *itemIdList, markerTitle, markerCreatorId, pictureCreatorId, videoPath, refreshTime, hiddenFlag',
      markerMD5: '&index',
    })
  }
}

const db = new AppDatabase()

export default db
