import type { MaybeComputedRef } from '@vueuse/core'

// ==================== 基础筛选模型 ====================
interface PresetType {
  basic: Record<string, MBFItem>
  advanced: MAFGroup[]
}

export type FilterType = keyof PresetType

interface ExtractFilter<K extends FilterType> {
  name: string
  type: K
  conditions: PresetType[K]
}

export type FilterPreset = ExtractFilter<'basic'> | ExtractFilter<'advanced'>

export interface MBFItem {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

// ==================== 高级筛选模型 ====================
export interface MAFGroup {
  key: string
  // true 为 AND，false 为 OR
  operator: boolean
  opposite: boolean
  children: MAFItem[]
}

export interface MAFItem {
  key: string
  id: number
  // true 为 AND，false 为 OR
  operator: boolean
  opposite: boolean
  value: MAFValue
}

export interface MAFGroupComposed {
  key: string
  operator: boolean
  opposite: boolean
  children: MAFItemComposed[]
}

export interface MAFItemComposed {
  key: string
  id: number
  operator: boolean
  opposite: boolean
  value: MAFValue
  option: MaybeComputedRef<MAFOption>
  meta: MAFMeta
  semantic?: (val: MAFValue, opt: MAFOption, meta: MAFMeta, opposite: boolean) => MAFSemanticUnit[]
  filter?: (val: MAFValue, opt: MAFOption, meta: MAFMeta, marker: API.MarkerVo) => boolean
}

export type MAFSemanticType =
  'logic-operator' |
  'opposite-indicator' |
  'parenthesis' |
  'error' |
  'regex' |
  'tag' |
  'highlight' |
  'text' |
  'number'

export interface MAFSemanticUnit {
  type: MAFSemanticType
  text?: string
}

export interface MAFConfig {
  readonly id: number
  readonly name: string
  readonly option: MaybeComputedRef<MAFOption>
  readonly defaultVal: MAFValue
  prepare(val: MAFValue, opt: MAFOption): MAFMeta
  semantic(val: MAFValue, opt: MAFOption, meta: MAFMeta, opposite: boolean): MAFSemanticUnit[]
  filter(val: MAFValue, opt: MAFOption, meta: MAFMeta, marker: API.MarkerVo): boolean
}

// ==================== 数据模型 ====================
export interface MAFValue {}

export interface MAFValueDummy extends MAFValue {
}

export interface MAFValueString extends MAFValue {
  s: string
}

export interface MAFValueStringArray extends MAFValue {
  sa: string[]
}

export interface MAFValueNumber extends MAFValue {
  n: number | null
}

export interface MAFValueNumberArray extends MAFValue {
  na: number[]
}

export interface MAFValueNumberRange extends MAFValue {
  nMin: number | null
  nMax: number | null
}

export interface MAFValueBoolean extends MAFValue {
  b: boolean
}

// ==================== 配置模型 ====================
export interface MAFOption {}

export interface MAFOptionDummy extends MAFOption {
}

export interface MAFOptionInput extends MAFOption {
  placeholder?: string
}

export interface MAFOptionSelect<T> extends MAFOption {
  dialogTitle?: string
  dialogListClass?: string
  options: T[]
  optionSelectMultiple?: boolean
  optionLabel: string
  optionValue: string
}

export interface MAFOptionRange extends MAFOption {
  placeholderMin?: string
  placeholderMax?: string
  startMin?: number
  startMinIncluded?: boolean
  startMax?: number
  startMaxIncluded?: boolean
  endMin?: number
  endMinIncluded?: boolean
  endMax?: number
  endMaxIncluded?: boolean
}

export interface MAFOptionSwitch extends MAFOption {
  textInactive?: string
  textActive?: string
}

// ==================== 预处理数据模型 ====================
export interface MAFMeta {}

export interface MAFMetaDummy extends MAFMeta {
}

export interface MAFMetaIdRange extends MAFMeta {
  idRange: ([number, number] | number)[]
  idSet: Set<number>
}

export interface MAFMetaContentRegex extends MAFMeta {
  /** 解析过的正则表达式，null 表示解析失败，undefined 表示空 */
  re?: RegExp | null
}

export interface MAFMetaUndergroundLayer extends MAFMeta {
  layerKeyMap: Record<string, {
    areaId: number
    areaName: string
    groupKey: string
    groupName: string
  }[]>
  layerNameMap: Record<string, string>
  tagList: string[]
  tag: string
}

export interface MAFMetaLinkageAction extends MAFMeta {
  linkActionMap: Map<string, Set<string>>
  tagList: string[]
  tag: string
}

export interface MAFMetaRefreshTime extends MAFMeta {
  isCustom: boolean
  tagNameMap: Record<number, string>
}

export interface MAFMetaVisibility extends MAFMeta {
  tagList: string[]
  tag: string
}

export interface MAFMetaArea extends MAFMeta {
  tagList: string[]
  tag: string
  areaParentIdMap: Record<number, number>
  itemIds: Set<number>
}

export interface MAFMetaItemType extends MAFMeta {
  tagList: string[]
  tag: string
  itemIds: Set<number>
}

export interface MAFMetaItemName extends MAFMeta {
  tagList: string[]
  itemIds: Set<number>
}

export interface MAFMetaItemNameRegex extends MAFMeta {
  /** 解析过的正则表达式，null 表示解析失败，undefined 表示空 */
  re?: RegExp | null
  itemIds: Set<number>
}
