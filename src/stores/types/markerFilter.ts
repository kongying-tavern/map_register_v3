import type { Component } from 'vue'

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
  icon?: Component
  template: Component
  option: MAFOption
  defaultVal: MAFValue
  semantic: (val: MAFValue, opt: MAFOption, opposite: boolean) => string
  filter: (val: MAFValue, opt: MAFOption, item: API.MarkerVo) => boolean
}

// ==================== 数据模型 ====================
/** 缺省 */
export interface MAFValueDummy {
}

/** 输入框 */
export interface MAFValueInput {
  v: string
}

export type MAFValue = MAFValueDummy | MAFValueInput

// ==================== 配置模型 ====================
/** 缺省 */
export interface MAFOptionDummy {}

/** 输入框 */
export interface MAFOptionInput {
  placeholder?: string
}

export type MAFOption = MAFOptionDummy | MAFOptionInput
