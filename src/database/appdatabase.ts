import { Dexie } from 'dexie'
import { markerFormater } from './middleware'
import type { UserPreference } from '@/stores/types'

// TODO 后期把数据库的 md5 表名改为 digest
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

  /** 用户首选项 @本地 */
  declare user: Dexie.Table<UserPreference, number>

  /** 图片缓存 @本地 */
  declare imageCache: Dexie.Table<ImageCache, string>

  /** 数据摘要 @本地 */
  declare digest: Dexie.Table<DigestInfo, string>

  constructor() {
    super('AppDatabase')

    this
      .use(markerFormater)
      .version(2.7)
      .stores({
        area: '&id, parentId, name, code, hiddenFlag',
        iconTag: '&tag, *typeIdList',
        item: '&id, *typeIdList, areaId, name, specialFlag, hiddenFlag',
        itemType: '&id, name, hiddenFlag',
        marker: '&id, *itemIdList, markerTitle, refreshTime, hiddenFlag',
        user: '&id',
        imageCache: '&id',
        digest: '&code, tableName',
      })
  }

  #requireInitTables = []

  /**
   * 初始化业务数据状态
   * @deprecated
   */
  reset = async () => {
    await Promise.all(this.#requireInitTables.map(tableName => this.table(tableName).clear()))
  }
}

/** 摘要的实体结构 */
export interface DigestInfo {
  /** 摘要的值 */
  code: string

  /** 当前摘要控制的表名 */
  tableName: string

  /** 当前摘要在对应表下的序号 */
  index: number

  /** 当前摘要控制的表的 key 的范围 */
  range: DigestRange<string> | DigestRange<number>
}

export type DigestRange<T> = [lower: T, upper: T]

/** 图片缓存的实体结构，该实体是一个复合类型 */
export interface ImageCacheMap {
  tagSprite: {
    image: ArrayBuffer
    mapping: Record<string, [number, number]>
  }
  markerIcons: {
    positionImageMap: Record<string, ArrayBuffer>
    tagPositionMap: Record<string, string>
    commonMapping: {
      width: number
      height: number
      anchorX: number
      anchorY: number
    }
  }
}

type MapToSchema<T> = {
  [K in keyof T]: {
    id: K
    value: T[K]
  }
}[keyof T]

export type ImageCache = MapToSchema<ImageCacheMap>
