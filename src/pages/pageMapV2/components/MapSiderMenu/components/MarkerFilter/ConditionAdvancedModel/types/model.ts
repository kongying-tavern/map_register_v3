import type { Component } from 'vue'

// ==================== 高级筛选模型 ====================
export interface ConditionAdvancedModel {
  id: number
  name: string
  icon?: Component
  template?: Component
  option?: ConditionAdvancedValue
  semantic: (val: ConditionAdvancedValue, opt: ConditionAdvancedOption, opposite: boolean) => string
  filter: (val: ConditionAdvancedValue, opt: ConditionAdvancedOption, item: API.MarkerVo) => boolean
}

// ==================== 高级筛选配置类型 ====================
export type ConditionAdvancedOption = Record<string, unknown>

// ==================== 高级筛选数据类型 ====================
export type ConditionAdvancedValue = Record<string, unknown>
