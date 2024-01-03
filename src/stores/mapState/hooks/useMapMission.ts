import type { GSMapState } from '@/stores/types/genshin-map-state'

export const useMapMission = () => {
  const mission = shallowRef<GSMapState.Mission | null>(null)

  const setMission = (newMission: GSMapState.Mission | null) => {
    mission.value = newMission
  }

  const subscribeMission = <K extends keyof GSMapState.MissionTypeMap>(type: K, getDefaultValue: () => GSMapState.MissionTypeMap[K]) => {
    const data = shallowRef<GSMapState.MissionTypeMap[K]>(getDefaultValue())

    const unsubscribe = watch(mission, (newMission) => {
      if (newMission?.type !== type) {
        data.value = getDefaultValue()
        return
      }
      data.value = newMission.value as GSMapState.MissionTypeMap[K]
    }, { deep: true })

    const update = (value: GSMapState.MissionTypeMap[K]) => {
      if (!mission.value || mission.value.type === 'markerDragging') {
        mission.value = {
          type,
          value,
        } as GSMapState.Mission
      }
    }

    const updateBy = (cb: (oldData: GSMapState.MissionTypeMap[K]) => GSMapState.MissionTypeMap[K]) => {
      const newData = cb(data.value as GSMapState.MissionTypeMap[K])
      update(newData)
    }

    const clear = () => {
      if (mission.value?.type !== type)
        return
      mission.value = null
    }

    return { data, unsubscribe, update, updateBy, clear }
  }

  return {
    mission,
    setMission,
    subscribeMission,
  }
}
