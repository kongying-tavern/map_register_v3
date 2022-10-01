import type { IconType } from '.'

/** 图标类型关联列表 */
export interface IconTypeList {
  iconTypeList?: IconTypeListElement[]
}

export interface IconTypeListElement extends Omit<IconType, 'parent'> {
  /**
   * 子分类列表，注意，此处子分类结构与父级一致，可无穷嵌套
   */
  son: Omit<IconType, 'parent'>[]
}
