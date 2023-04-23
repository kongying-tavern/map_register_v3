import { Dexie } from 'dexie'
import { markerFormater } from './middleware'

/** MD5 表项 */
export interface MD5Vo {
  /** 点位 id 为 marker-0、marker-1，物品 id 为 item-0，以此类推 */
  id: string
  /** md5 的值 */
  value: string
}

export class AppDatabase extends Dexie {
  /** 地区表 */
  declare area: Dexie.Table<API.AreaVo, number>
  /** 图标表 */
  declare icon: Dexie.Table<API.IconVo, number>
  /** 图标标签表 */
  declare iconTag: Dexie.Table<API.TagVo, number>
  /** 物品表 */
  declare item: Dexie.Table<API.ItemVo, number>
  /** 物品类型表 */
  declare itemType: Dexie.Table<API.ItemTypeVo, number>
  /** 点位表 */
  declare marker: Dexie.Table<API.MarkerVo, number>
  /** MD5 记录表 */
  declare md5: Dexie.Table<MD5Vo, string>

  constructor() {
    super('AppDatabase')

    this
      .use(markerFormater)
      .version(1.6)
      .stores({
        area: '&areaId, parentId, name, code, hiddenFlag',
        icon: '&iconId, name',
        iconTag: '&iconId, tag',
        item: '&itemId, *typeIdList, areaId, name, specialFlag, hiddenFlag',
        itemType: '&typeId, name, hiddenFlag',
        marker: '&id, *itemIdList, markerTitle, refreshTime, hiddenFlag',
        md5: '&id',
      })
  }
}

// (window as any).Dexie = Dexie
