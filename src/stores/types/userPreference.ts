/**
 * ### 用户首选项
 * 除基本信息外，索引必须遵守命名格式：`${namespace}.${type}.${key}`
 */
export interface UserPreference {
  // ====================     base     ====================

  /** 用户 id */
  'id'?: number

  // ====================     map      ====================

  /** 显示区域名称标签 */
  'map.setting.showZoneTag'?: boolean

  /** 透明化状态为已完成的点位 */
  'map.setting.transparentMarked'?: boolean

  /** 性能优化：是否在视图更新时禁用点位拾取 */
  'map.setting.pauseViewChangingPicking'?: boolean

  /** 地图最后停留的中心点位置 */
  'map.viewState.target'?: API.Coordinate2D

  /** 显示附加图层 */
  'map.state.showOverlay'?: boolean

  // ====================   database   ====================

  /** 数据库全量更新间隔（毫秒） */
  'database.setting.updateTimeGap'?: number

  // ==================== mapSiderMenu ====================

  /** 侧边栏折叠状态 */
  'mapSiderMenu.state.collapse': boolean

  /** 侧边栏当前激活的 tab */
  'mapSiderMenu.state.tabName'?: string

  // ==================== markerFilter ====================

  /** 筛选器存储的预设 */
  'markerFilter.setting.presets'?: FilterPreset[]

  /** 筛选器自动跳转下一步 */
  'markerFilter.setting.autoNext'?: boolean

  /** 筛选器选择的Tab */
  'markerFilter.state.step': number

  /** 筛选器选择的父级地区 */
  'markerFilter.state.parentAreaCode'?: string

  /** 筛选器选择的子级地区 */
  'markerFilter.state.areaCode'?: string

  /** 筛选器选择的分类 */
  'markerFilter.state.itemTypeId'?: number

  /** 筛选器选择的物品 */
  'markerFilter.state.itemIds'?: number[]

  /** 正在标记的物品 id */
  'markerFilter.state.defaultMarkingItemId'?: number

  // ==================== setting panel ====================

  /** 设置面板当前激活的设置项 */
  'settingPanel.state.activedKey'?: string
}

export const getDefaultPreference = (): UserPreference => ({
  'mapSiderMenu.state.collapse': false,
  'markerFilter.state.step': 0,
})

/** 筛选器预设 */
export interface FilterPreset {
  name: string
  conditions: Record<string, Condition>
}

export interface Condition {
  area: API.AreaVo
  type: API.ItemTypeVo
  items: number[]
}
