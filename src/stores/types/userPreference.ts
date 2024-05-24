import type { FilterPreset, FilterType, MAFGroup } from '.'

/**
 * ### 用户首选项
 * 除基本信息外，索引必须遵守命名格式：`${namespace}.${type}.${key}`
 */
export interface UserPreference {
  // ====================     base     ====================

  /** 用户 id */
  'id'?: number

  // ====================    用户中心    ====================

  /** 是否显示限定地区 */
  'userCenter.setting.showRestrictedArea'?: boolean

  // ====================      公告      ====================

  /** 公告阅读记录 */
  'notice.state.readingRecords'?: number[]

  // ====================      地图      ====================

  /** 显示区域名称标签 */
  'map.setting.showZoneTag': boolean

  /** 透明化状态为已完成的点位 */
  'map.setting.transparentMarked': boolean

  /** 性能优化：是否在视图更新时禁用点位拾取 */
  'map.setting.pauseViewChangingPicking'?: boolean

  /** 隐藏点位弹窗 */
  'map.setting.hideMarkerPopover'?: boolean

  /** 地图缩放时的过渡时间 */
  'map.setting.zoomTransitionDuration': number

  /** 地图最后停留的中心点位置 @todo 保留，可能有性能问题 */
  'map.viewState.target'?: API.Coordinate2D

  /** 显示附加图层 */
  'map.state.showOverlay'?: boolean

  // ====================     数据库     ====================

  /** 数据库全量更新间隔（毫秒） */
  'database.setting.updateTimeGap'?: number

  // ====================   地图侧边栏   ====================

  /** 侧边栏折叠状态 */
  'mapSiderMenu.state.collapse': boolean

  /** 侧边栏当前激活的 tab */
  'mapSiderMenu.state.tabName': string

  // ====================      点位      ====================

  /** 筛选器存储的预设 */
  'markerFilter.setting.presets'?: FilterPreset[]

  /** 筛选器自动跳转下一步 */
  'markerFilter.setting.autoNext': boolean

  /** 筛选器筛选类型 */
  'markerFilter.setting.filterType': FilterType

  /** 筛选器选择的Tab */
  'markerFilter.state.step': number

  /** 筛选器选择的父级地区 */
  'markerFilter.state.parentAreaCode': string

  /** 筛选器选择的子级地区 */
  'markerFilter.state.areaCode': string

  /** 筛选器选择的分类 */
  'markerFilter.state.itemTypeId'?: number

  /** 筛选器选择的物品 */
  'markerFilter.state.itemIds'?: number[]

  /** 正在标记的物品 id */
  'markerFilter.state.defaultMarkingItemId'?: number

  /** 高级筛选器缓存 */
  'markerFilter.filter.advancedFilterCache': MAFGroup[]

  /** 高级筛选器配置 */
  'markerFilter.filter.advancedFilter': MAFGroup[]

  // ====================     设置面板     ====================

  /** 设置面板当前激活的设置项 */
  'settingPanel.state.activedKey': string

  // ====================      快捷键      ====================
  // key 必须按照 `hotkeys.${type}.${name}` 的格式命名
  // value 可以为单键 key 或以 `+` 拼接的 key 组合：`W`、`Ctrl+A`
  // type 取值:
  // 1. `press` 点按生效，按住会反复触发
  // 2. `hold` 按住生效

  /** @todo 快捷键 - 按下指定键隐藏点位弹窗 */
  'hotkeys.press.toggleMarkerPopoverVisible'?: string

  // ====================      socket      ====================

  /** 允许在接收 web socket 事件时通知用户 */
  'socket.setting.enableNotice'?: boolean

  /** 允许弹出通知的 web socket 事件 */
  'socket.setting.noticeEvents'?: API.WSEventType[]

  // ====================      开发者      ====================

  /** 是否隐藏 service worker 缓存 logger  */
  'developer.setting.hideServiceWorkerLogger'?: boolean

  /** 是否隐藏数据库自动更新 logger */
  'developer.setting.hideDatabaseUpdaterLogger'?: boolean

  /** 是否隐藏图层组的 logger */
  'developer.setting.hideCompositeLayerLogger'?: boolean
}

export const getDefaultPreference = (): UserPreference => ({
  // map
  'map.setting.showZoneTag': true,
  'map.setting.transparentMarked': true,
  'map.setting.zoomTransitionDuration': 66,

  // mapSiderMenu
  'mapSiderMenu.state.tabName': 'filter',
  'mapSiderMenu.state.collapse': false,

  // markerFilter
  'markerFilter.filter.advancedFilterCache': [],
  'markerFilter.filter.advancedFilter': [],
  'markerFilter.state.step': 0,
  'markerFilter.state.parentAreaCode': 'C:FD',
  'markerFilter.state.areaCode': 'A:FD:FENGDAN',
  'markerFilter.setting.autoNext': true,
  'markerFilter.setting.filterType': 'basic',
  'markerFilter.setting.presets': [],

  // settingPanel
  'settingPanel.state.activedKey': 'dashboard',

  // socket
  'socket.setting.enableNotice': true,
  'socket.setting.noticeEvents': ['UserKickedOut'],
})
