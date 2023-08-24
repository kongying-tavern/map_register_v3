import { defineStore } from 'pinia'

export const useMapSettingStore = defineStore('map-setting', {
  state: () => ({
    /** 显示调试信息 */
    showTooltip: false,
    /** 显示附加图层 */
    showOverlay: false,
    /** 隐藏标记点位 */
    hideMarkedMarker: true,
  }),

  actions: {
  },
})
