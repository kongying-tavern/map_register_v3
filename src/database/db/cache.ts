import type { ScoreGeneratedCache } from 'types/database'
import { Dexie } from 'dexie'

/** 本地缓存数据库 */
export class CacheDexie extends Dexie {
  /** dadian json 订阅数据 */
  declare dadianJson: Dexie.Table<DBType.DadianJSON, string>

  /** 用户评分 */
  declare userScore: Dexie.Table<ScoreGeneratedCache, string>

  /** 图标预渲染纹理 */
  declare iconSprite: Dexie.Table<DBType.IconSprite, string>

  /** 点位预渲染纹理 */
  declare markerSprite: Dexie.Table<DBType.MarkerSprite, string>

  /** 结构版本 */
  readonly VERSION = 1

  /** 表结构 */
  readonly STORES = {
    dadianJson: '&digest',
    iconSprite: '&digest',
    markerSprite: '&digest',
    userScore: '&id',
  }

  constructor() {
    super('AppCache')
    this
      .version(this.VERSION)
      .stores(this.STORES)
  }
}
