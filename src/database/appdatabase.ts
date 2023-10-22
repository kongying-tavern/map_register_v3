import { Dexie } from 'dexie'
import { markerFormater } from './middleware'
import type { UserPreference } from '@/stores'

/** MD5 表项 */
export interface MD5Vo {
  /** 点位 id 为 marker-0、marker-1，物品 id 为 item-0，以此类推 */
  id: string
  /** md5 的值 */
  value: string
}

export interface ImageCache {
  id: string
  mapping: Record<string, [number, number]>
  image: ArrayBuffer
}

export class AppDatabase extends Dexie {
  /** 地区表 @全量接口 */
  declare area: Dexie.Table<API.AreaVo, number>
  /** 图标标签表 @全量接口 */
  declare iconTag: Dexie.Table<API.TagVo, string>
  /** 物品表 @全量接口 */
  declare item: Dexie.Table<API.ItemVo, number>
  /** 物品类型表 @分页接口 */
  declare itemType: Dexie.Table<API.ItemTypeVo, number>
  /** 点位表 @全量接口 */
  declare marker: Dexie.Table<API.MarkerVo, number>
  /** MD5 记录表 @本地 */
  declare md5: Dexie.Table<MD5Vo, string>
  /** 用户表 @本地 */
  declare user: Dexie.Table<UserPreference, number>
  /** 图片缓存 @本地 */
  declare imageCache: Dexie.Table<ImageCache, string>

  constructor() {
    super('AppDatabase')

    this
      .use(markerFormater)
      .version(2.2)
      .stores({
        area: '&id, parentId, name, code, hiddenFlag',
        iconTag: '&tag, *typeIdList',
        item: '&id, *typeIdList, areaId, name, specialFlag, hiddenFlag',
        itemType: '&id, name, hiddenFlag',
        marker: '&id, *itemIdList, markerTitle, refreshTime, hiddenFlag',
        md5: '&id',
        user: '&id',
        imageCache: '&id',
      })
  }

  #requireInitTables = []

  /**
   * 初始化业务数据状态
   * @todo 该方法是处理 “全量数据模式下无法同步已删除项” 这一问题的权宜之计
   */
  reset = async () => {
    await Promise.all(this.#requireInitTables.map(tableName => this.table(tableName).clear()))
  }
}
