import type { Condition } from '@/pages/pageMapV2/core'

/**
 * ### 用户首选项
 * 1. 索引必须遵守命名格式：`${namespace}.${scope_0}.${scope_1}`
 * 2. `scope` 最好不多于 2 层
 */
export interface UserPreference {
  // ====================     base     ====================

  /** 用户 id */
  'id'?: number

  // ====================     map      ====================

  /** 地图相关持久设置/状态 */

  // ==================== mapSiderMenu ====================

  /** 侧边栏折叠状态 */
  'mapSiderMenu.state.collapse'?: boolean

  // ==================== markerFilter ====================

  /** 筛选器存储的预设 */
  'markerFilter.setting.presets'?: FilterPreset[]

  /** 筛选器选择的Tab */
  'markerFilter.state.step'?: number

  /** 筛选器选择的地区 */
  'markerFilter.state.areaCode'?: string

  /** 筛选器选择的分类 */
  'markerFilter.state.itemTypeId'?: number

  /** 筛选器选择的物品 */
  'markerFilter.state.itemIds'?: number
}

/** 筛选器预设 */
export interface FilterPreset {
  name: string
  conditions: Record<string, Condition>
}
