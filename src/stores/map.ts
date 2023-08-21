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
    lockViewState: false,
    mission: null as MissionType | null,
    active: null as unknown,
    hover: null as unknown,
    focus: null as unknown,
  }),

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
