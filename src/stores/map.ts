import { defineStore } from 'pinia'
import type { Coordinate2D } from '@/pages/pageMapV2/core'

export interface MissionMap {
  createMarker: Coordinate2D
  moveMarkers: { origin: API.MarkerVo; offset: Coordinate2D }[]
}

type MissionType = {
  [K in keyof MissionMap]: { type: K; value: MissionMap[K] }
}[keyof MissionMap]

export const useMapStore = defineStore('map-state', {
  state: () => ({
    mission: null as MissionType | null,
  }),

  actions: {
    createMission<T extends keyof MissionMap>(type: T, value: MissionMap[T]) {
      if (this.mission)
        return
      this.mission = { type, value } as MissionType
    },

    consumeMission() {
      this.mission = null
    },
  },
})
