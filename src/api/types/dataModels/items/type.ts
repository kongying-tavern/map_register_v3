/** 物品类型 */
export interface Type {
  /**
   * 类型补充说明
   */
  content?: string
  /**
   * 显隐方式
   */
  hiddenFlag?: string
  /**
   * 图标标签
   */
  iconTag?: string
  /**
   * 是否为末端类型
   */
  isFinal?: string
  /**
   * 类型名
   */
  name?: string
  /**
   * 父级类型ID（无父级则为-1）
   */
  parentId?: string
  /**
   * 排序
   */
  sortIndex?: string
  /**
   * 类型ID
   */
  typeId?: string
}
