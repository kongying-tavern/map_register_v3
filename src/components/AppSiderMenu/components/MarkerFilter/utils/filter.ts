import type {
  FilterConditions,
  FilterConditionsAdvanced,
  FilterConditionsBasic,
} from '../types'
import type { MBFItem } from '@/stores/types'

export function isBaseFilter(
  conditions: FilterConditions,
): conditions is FilterConditionsBasic {
  return !Array.isArray(conditions)
}

export function isAdvancedFilter(
  conditions: FilterConditions,
): conditions is FilterConditionsAdvanced {
  return Array.isArray(conditions)
}

export function toConditionsBaseMap(
  conditions: FilterConditionsBasic,
): Map<string, MBFItem> {
  return conditions instanceof Map ? conditions : new Map(Object.entries(conditions))
}

export function toConditionsBaseRecord(
  conditions: FilterConditionsBasic,
): Record<string, MBFItem> {
  return conditions instanceof Map ? Object.fromEntries(conditions) : conditions
}
