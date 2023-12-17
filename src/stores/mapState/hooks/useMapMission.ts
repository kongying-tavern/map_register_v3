import type { GSMapState } from '@/stores/types/genshin-map-state'

const strategy: {
  [K in keyof GSMapState.MissionTypeMap]: {
    isEqual: (a: GSMapState.MissionTypeMap[K], b: GSMapState.MissionTypeMap[K]) => boolean
  }
} = {
  markerDragging: {
    isEqual: () => false,
  },
}

export const useMapMission = () => {
  const mission = shallowRef<GSMapState.Mission | null>(null)

  const setMission = (newMission: GSMapState.Mission | null) => {
    const oldMission = mission.value
    if (!oldMission || !newMission || oldMission.type !== newMission.type) {
      mission.value = newMission
      return
    }
    if (strategy[newMission.type].isEqual(newMission.value, oldMission.value))
      return
    mission.value = newMission
  }

  return {
    mission,
    setMission,
  }
}
