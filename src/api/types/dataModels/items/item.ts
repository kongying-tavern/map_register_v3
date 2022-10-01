/**
 * 物品信息
 */
export interface ItemInfo {
  /**
   * 地区ID
   */
  areaId?: number
  /**
   * 默认描述模板
   */
  defaultContent?: string
  /**
   * 默认点位计数
   */
  defaultCount?: number
  /**
   * 默认刷新时间
   */
  defaultRefreshTime?: number
  /**
   * 显隐方式
   */
  hiddenFlag?: number
  /**
   * 物品显示类型
   */
  iconStyleType?: number
  /**
   * 图标标签
   */
  iconTag?: string
  /**
   * 物品ID
   */
  itemId?: string
  /**
   * 物品名称
   */
  name?: string
  /**
   * 排序序号
   */
  sortIndex?: number
  /**
   * 物品类型ID列表
   */
  typeIdList?: number[]
}
