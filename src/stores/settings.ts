export interface GlobalSetting {
  /** 根据点位坐标将地图移动到点集中心 */
  moveToCenter: boolean
  /** 在筛选器满足条件时自动跳转到下一级 */
  autoTurnNext: boolean
  /** 定时更新的时间间隔 */
  autoUpdateInterval: number
  /** 是否需要为成功更新的数据弹出消息提示 */
  noticeDataUpdated: boolean
  /** 是否开启点位 hover 反馈 */
  markerHoverFeedback: boolean
  /** @彩蛋 是否卡半岩 */
  waittingGeo: boolean
}

// TODO 云同步设置
export const localSettings = useLocalStorage<GlobalSetting>('__ys_global_settings', {
  moveToCenter: true,
  autoTurnNext: true,
  noticeDataUpdated: true,
  autoUpdateInterval: 20,
  markerHoverFeedback: false,
  waittingGeo: false,
})
