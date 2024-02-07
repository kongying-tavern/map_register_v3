import { ItemTypeManager } from './itemType'
import { IconTypeManager } from './iconType'
import { TagTypeManager } from './tagType'

export {
  ItemTypeManager,
  IconTypeManager,
  TagTypeManager,
}

export const TYPE_MANAGER_KEY_MAP = {
  itemType: new ItemTypeManager(),
  iconType: new IconTypeManager(),
  tagType: new TagTypeManager(),
}

export type TypeManagerMap = typeof TYPE_MANAGER_KEY_MAP

export type TypeManagerKeys = keyof TypeManagerMap

export const TYPE_MANAGER_OPTIONS: { label: string; value: TypeManagerKeys }[] = Object
  .entries(TYPE_MANAGER_KEY_MAP)
  .map(([typeKey, typeManager]) => ({
    label: typeManager.info.label,
    value: typeKey as TypeManagerKeys,
  }))
