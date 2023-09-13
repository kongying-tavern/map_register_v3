import { defineStore } from 'pinia'
import type { Coordinate2D } from '@/pages/pageMapV2/core'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'

export interface MissionMap {
  createMarker: Coordinate2D
  moveMarkers: { origin: API.MarkerVo; offset: Coordinate2D }[]
}

type MissionType = {
  [K in keyof MissionMap]: { type: K; value: MissionMap[K] }
}[keyof MissionMap]

/** 地图临时状态 */
export const useMapStore = defineStore('map-state', {
  state: () => ({
    lockViewState: false,
    currentLayerCode: '',
    mission: null as MissionType | null,
    hover: null as API.MarkerVo | null,
    focus: null as API.MarkerVo | null,
    markingItem: null as API.ItemVo | null,
  }),

  getters: {
    currentLayer: (state) => {
      return LAYER_CONFIGS.find(({ code }) => code === state.currentLayerCode)
    },

    currentAreaCodes(): Set<string> {
      return new Set(this.currentLayer?.areaCodes)
    },
  },

  actions: {
    setMission<T extends keyof MissionMap>(type: T, value: MissionMap[T]) {
      if (this.mission)
        return
      this.mission = { type, value } as MissionType
    },

    getMission<T extends keyof MissionMap>(type: T): MissionMap[T] | undefined {
      if (this.mission?.type !== type)
        return undefined
      return this.mission.value as MissionMap[T]
    },

    clearMission() {
      this.mission = null
    },
  },
})
