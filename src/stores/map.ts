import { defineStore } from 'pinia'

type MapToSchema<T> = {
  [K in keyof T]: {
    type: K
    value: T[K]
  }
}[keyof T]

/** 可以创建为 mission 的类型 */
export interface MissionMap {
  createMarker: API.Coordinate2D
  moveMarkers: { origin: API.MarkerVo; offset: API.Coordinate2D }[]
}
export type MissionType = MapToSchema<MissionMap>

/** 可以交互的类型 */
export interface InteractiveMap {
  /** 点位信息 */
  marker: API.MarkerVo
  /** 移动点位信息 */
  movingMarker: {
    origin: API.MarkerVo
    offset: API.Coordinate2D
  }
  /** overlay 的单元 id */
  overlay: string
}
export type InteractiveType = MapToSchema<InteractiveMap>

/** 地图临时状态 */
export const useMapStore = defineStore('map-state', {
  state: () => ({
    lockViewState: false,
    currentLayerCode: '',
    mission: null as MissionType | null,
    hover: null as InteractiveType | null,
    focus: null as InteractiveType | null,
    markingItem: null as API.ItemVo | null,
  }),

  actions: {
    setMission<T extends keyof MissionMap>(type: T, value: MissionMap[T]) {
      this.mission = { type, value } as MissionType
    },

    getMission<T extends keyof MissionMap>(type: T): MissionMap[T] | null {
      return this.mission?.type === type ? this.mission.value as MissionMap[T] : null
    },

    setHover<T extends keyof InteractiveMap>(type: T, value: InteractiveMap[T]) {
      this.hover = { type, value } as InteractiveType
    },

    getHover<T extends keyof InteractiveMap>(type: T): InteractiveMap[T] | null {
      return this.hover?.type === type ? this.hover.value as InteractiveMap[T] : null
    },

    setFocus<T extends keyof InteractiveMap>(type: T, value: InteractiveMap[T]) {
      this.focus = { type, value } as InteractiveType
    },

    getFocus<T extends keyof InteractiveMap>(type: T): InteractiveMap[T] | null {
      return this.focus?.type === type ? this.focus.value as InteractiveMap[T] : null
    },

    clear(state: 'mission' | 'hover' | 'focus' | 'markingItem') {
      if (!this[state] || !(state in this))
        return
      this[state] = null
    },
  },
})
