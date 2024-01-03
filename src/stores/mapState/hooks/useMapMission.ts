import type { GSMapState } from '@/stores/types/genshin-map-state'

export const useMapMission = () => {
  const mission = shallowRef<GSMapState.Mission | null>(null)

  /** 仅限不关注任务类型的情况下调用 */
  const setMission = (newMission: GSMapState.Mission | null) => {
    mission.value = newMission
  }

  /** 关注某一任务类型的情况下，必须通过该 API 进行任务更新操作 */
  const subscribeMission = <K extends keyof GSMapState.MissionTypeMap>(type: K, getDefaultValue: () => GSMapState.MissionTypeMap[K]) => {
    const data = shallowRef<GSMapState.MissionTypeMap[K]>(getDefaultValue())

    /** 是否空闲 */
    const isEmpty = computed(() => !mission.value)

    /** 是否可以进行任务设置（包括任务为空） */
    const isEnable = computed(() => {
      return !mission.value || mission.value.type === type
    })

    /** 是否正在处理指定为 type 类型的任务 */
    const isProcessing = computed(() => {
      return mission.value?.type === type
    })

    const unsubscribe = watch(mission, (newMission) => {
      if (newMission?.type !== type) {
        data.value = getDefaultValue()
        return
      }
      data.value = newMission.value as GSMapState.MissionTypeMap[K]
    }, { deep: true })

    const update = (value: GSMapState.MissionTypeMap[K] | null) => {
      if (!mission.value || mission.value.type === 'markerDragging') {
        mission.value = value === null
          ? null
          : {
              type,
              value,
            } as GSMapState.Mission
      }
    }

    /** 有时候需要在确保某种类型的任务更新后才执行某些操作 */
    const updateBy = (cb: (oldData: GSMapState.MissionTypeMap[K], setter: (newData: GSMapState.MissionTypeMap[K] | null) => void) => void) => {
      if (mission.value?.type !== type)
        return
      cb(data.value as GSMapState.MissionTypeMap[K], (newData) => {
        update(newData)
      })
    }

    const clear = () => {
      if (mission.value?.type !== type)
        return
      mission.value = null
    }

    return { isEmpty, isEnable, isProcessing, data, unsubscribe, update, updateBy, clear }
  }

  return {
    mission,
    setMission,
    subscribeMission,
  }
}
