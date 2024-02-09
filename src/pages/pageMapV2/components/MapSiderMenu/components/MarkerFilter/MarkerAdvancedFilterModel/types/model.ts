import type { Component } from 'vue'
import type {
  ConditionAdvancedOptInput,
  ConditionAdvancedValInput,
} from '.'

// ==================== 高级筛选模型 ====================
export interface ConditionAdvancedModel {
  id: number
  name: string
  icon?: Component
  template: Component
  option: ConditionAdvancedOpt
  defaultVal: ConditionAdvancedVal
  semantic: (val: ConditionAdvancedVal, opt: ConditionAdvancedOpt, opposite: boolean) => string
  filter: (val: ConditionAdvancedVal, opt: ConditionAdvancedOpt, item: API.MarkerVo) => boolean
}

// ==================== 高级筛选配置类型 ====================
export type ConditionAdvancedOpt = ConditionAdvancedOptInput

// ==================== 高级筛选数据类型 ====================
export type ConditionAdvancedVal = ConditionAdvancedValInput
