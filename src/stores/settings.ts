export interface GlobalSetting {
  moveToCenter: boolean
  autoTurnNext: boolean
}

// TODO 云同步设置
export const localSettings = useLocalStorage<GlobalSetting>('global-settings', {
  /** 根据点位坐标将地图移动到点集中心 */
  moveToCenter: true,
  /** 在筛选器满足条件时自动跳转到下一级 */
  autoTurnNext: true,
})
