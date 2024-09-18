import { Dexie } from 'dexie'
import type { UserPreference } from '@/stores/types/userPreference'

/** 数据库核心定义 */
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

  /** 点位关联 @全量接口 */
  declare markerLink: Dexie.Table<API.MarkerLinkageVo, number>

  /** 用户存档 @仅限本地 */
  declare userArchive: Dexie.Table<UserArchiveBody, number>

  /** 用户首选项 @仅限本地 */
  declare user: Dexie.Table<UserPreference, number>

  /** 通用缓存 @仅限本地 */
  declare cache: Dexie.Table<DBType.InstancedCache, string>

  /** 数据摘要 @仅限本地 */
  declare digest: Dexie.Table<DBType.DigestInfo, string>

  /** WebSocket 事件 @仅限本地 */
  declare websocketEvents: Dexie.Table<Socket.DataEventRecord, string>

  /** 数据库结构版本 */
  readonly VERSION = 4.4

  constructor() {
    super('AppDatabase')
  }
}
