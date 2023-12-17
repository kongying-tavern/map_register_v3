import { Dexie } from 'dexie'
import { markerFormater } from './middleware'
import type { UserPreference } from '@/stores/types'

/** 应用数据库 */
export class AppDatabase extends Dexie {
  /** 地区 @全量接口 */
  declare area: Dexie.Table<API.AreaVo, number>

  /** 图标标签 @全量接口 */
  declare iconTag: Dexie.Table<API.TagVo, string>

  /** 物品 @全量接口 */
  declare item: Dexie.Table<API.ItemVo, number>

  /** 物品类型 @分页接口 */
  declare itemType: Dexie.Table<API.ItemTypeVo, number>

  /** 点位 @全量接口 */
  declare marker: Dexie.Table<API.MarkerVo, number>

  /** 用户首选项 @仅限本地 */
  declare user: Dexie.Table<UserPreference, number>

  /** 通用缓存 @仅限本地 */
  declare cache: Dexie.Table<DBType.InstancedCache, string>

  /** 数据摘要 @仅限本地 */
  declare digest: Dexie.Table<DBType.DigestInfo, string>

  constructor() {
    super('AppDatabase')
    this
      .use(markerFormater)
      .version(3.0)
      .stores({
        area: '&id, parentId, name, code, hiddenFlag',
        iconTag: '&tag, *typeIdList',
        item: '&id, *typeIdList, areaId, name, specialFlag, hiddenFlag',
        itemType: '&id, name, hiddenFlag',
        marker: '&id, *itemIdList, markerTitle, refreshTime, hiddenFlag',
        user: '&id',
        cache: '&id',
        digest: '&code, tableName',
      })
  }
}
