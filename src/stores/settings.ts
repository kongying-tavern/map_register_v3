export interface GlobalSetting {
  moveToCenter: boolean
}

// TODO 云同步设置
export const localSettings = useLocalStorage<GlobalSetting>('global-settings', {
  /** 根据点位坐标将地图移动到点集中心 */
  moveToCenter: true,
})
