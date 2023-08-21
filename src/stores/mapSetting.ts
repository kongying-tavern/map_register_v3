import { defineStore } from 'pinia'

export const useMapSettingStore = defineStore('map-setting', {
  state: () => ({
    showTooltip: false,
    hideMarkedMarker: true,
  }),

  actions: {
  },
})
