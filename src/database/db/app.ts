import { Dexie } from 'dexie'
import type { UserArchiveBody, ScoreGeneratedCache, Hash } from 'types/database'

/** 数据库核心定义 */
export class AppDatabase extends Dexie {
  /** 地区 @全量接口 */
  declare area: Dexie.Table<Hash<API.AreaVo>, number>

  /** 图标标签 @全量接口 */
  declare iconTag: Dexie.Table<Hash<API.TagVo>, string>

  /** 物品 @全量接口 */
  declare item: Dexie.Table<Hash<API.ItemVo>, number>

  /** 物品类型 @分页接口 */
  declare itemType: Dexie.Table<Hash<API.ItemTypeVo>, number>

  /** 点位 @全量接口 */
  declare marker: Dexie.Table<Hash<API.MarkerVo>, number>

  /** 点位关联 @全量接口 */
  declare markerLink: Dexie.Table<Hash<API.MarkerLinkageVo>, number>

  /** 用户存档 @仅限本地 */
  declare userArchive: Dexie.Table<UserArchiveBody, number>

  /** 通用缓存 @仅限本地 */
  declare cache: Dexie.Table<DBType.InstancedCache, string>

  /** WebSocket 事件 @仅限本地 */
  declare websocketEvents: Dexie.Table<Socket.DataEventRecord, string>

  /** 评分生成缓存月份 @仅限本地 */
  declare scoreCache: Dexie.Table<ScoreGeneratedCache, string>

  /** 数据库结构版本 */
  readonly VERSION = 4.6

  readonly STORES = {
    area: '&id, __hash',
    iconTag: '&tag, __hash',
    item: '&id, __hash',
    itemType: '&id, __hash',
    marker: '&id, __hash',
    markerLink: '&id, __hash',
    userArchive: 'id',
    cache: '&id',
    websocketEvents: '&key, time',
    scoreCache: '&id',
  }

  constructor() {
    super('AppDatabase')
  }
}
