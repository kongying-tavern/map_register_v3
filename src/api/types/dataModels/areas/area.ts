/**
 * 地区信息
 */
export interface Area {
  /**
   * 地区ID
   */
  areaId: number
  /**
   * 地区说明
   */
  content?: string
  /**
   * 显隐方式
   */
  hiddenFlag?: number
  /**
   * 图标标签
   */
  iconTag?: string
  /**
   * 是否为末端地区
   */
  isFinal: boolean
  /**
   * 地区名称
   */
  name?: string
  /**
   * 父级地区ID（无父级则为-1）
   */
  parentId?: number
  /**
   * 排序
   */
  sortIndex?: number
}
