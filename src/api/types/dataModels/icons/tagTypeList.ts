import type { TagType } from '.'

/** 图标类型关联列表 */
export interface TagTypeList {
  tagTypeList?: TagTypeListElement[]
}

export interface TagTypeListElement extends Omit<TagType, 'parent'> {
  /**
   * 子分类列表，注意，此处子分类结构与父级一致，可无穷嵌套
   */
  son?: Omit<TagType, 'parent'>[]
}
