/** 图标类型 */
export interface IconType {
  /**
   * 是否为末端类型
   */
  isFinal?: boolean
  /**
   * 分类名称
   */
  name?: string
  /**
   * 父级分类ID，-1为根分类
   */
  parent?: string
  /**
   * 分类ID
   */
  typeId?: string
}
