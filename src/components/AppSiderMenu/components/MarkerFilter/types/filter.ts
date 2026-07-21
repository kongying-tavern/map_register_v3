import type { MAFGroup, MBFItem } from '@/stores/types'

export type FilterConditionsBasic = Map<string, MBFItem> | Record<string, MBFItem>

export type FilterConditionsAdvanced = MAFGroup[]

export type FilterConditions = FilterConditionsBasic | FilterConditionsAdvanced
