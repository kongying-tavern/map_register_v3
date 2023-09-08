import { defineStore } from 'pinia'

// TODO 用户状态同步
/** 地图设置 */
export const useMapSettingStore = defineStore('map-setting', {
  state: () => ({
    /** 隐藏标记点位 */
    hideMarkedMarker: true,
    /** 显示图层边界 */
    showBorder: false,
    /** 显示附加图层 */
    showOverlay: false,
    /** 显示地图标签 */
    showTag: true,
    /** 显示调试信息 */
    showTooltip: false,
  }),

  actions: {
  },
})
