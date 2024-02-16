// ==================== 基础筛选模型 ====================
export type FilterType = 'basic' | 'advanced'

export interface FilterPreset {
  name: string
  type: FilterType
  conditions: Record<string, MBFItem> | MAFGroup[]
}

export interface MBFItem {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}

// ==================== 高级筛选模型 ====================
export interface MAFGroup {
  // true 为 AND，false 为 OR
  operator: boolean
  opposite: boolean
  children: MAFItem[]
}

export interface MAFItem {
  id: number
  // true 为 AND，false 为 OR
  operator: boolean
  opposite: boolean
  value: MAFValue
}

export interface MAFConfig {
  id: number
  name: string
  option: MAFOption
  defaultVal: MAFValue
  prepare: (val: MAFValue) => MAFMeta
  semantic: (val: MAFValue, opt: MAFOption, meta: MAFMeta, opposite: boolean) => string
  filter: (val: MAFValue, opt: MAFOption, meta: MAFMeta, marker: API.MarkerVo) => boolean
}

// ==================== 数据模型 ====================
export interface MAFValueDummy {}

export interface MAFValueInput {
  v: string
}

export type MAFValue = MAFValueDummy | MAFValueInput

// ==================== 配置模型 ====================
export interface MAFOptionDummy {}

export interface MAFOptionInput {
  placeholder?: string
}

export type MAFOption = MAFOptionDummy | MAFOptionInput

// ==================== 预处理数据模型 ====================
export interface MAFMetaDummy {}

export interface MAFMetaIdRange {
  idSet: Set<number>
}

export type MAFMeta = MAFMetaDummy | MAFMetaIdRange
