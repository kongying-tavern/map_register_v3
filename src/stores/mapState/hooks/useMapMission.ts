import type { ShallowRef } from 'vue'
import type { EventHook } from '@vueuse/core'
import type {
  Mission,
  MissionTypeMap,
} from '@/packages/map'
import { ensureFrom } from '@/utils'

// ============================== ↓ 共享地址而不是使用闭包，以避免订阅过多时导致的卡顿问题 ↓ ==============================
type MissionTypeKey = keyof MissionTypeMap
type MissionTypeValue = MissionTypeMap[MissionTypeKey]

type UpdateFunction<K extends keyof MissionTypeMap> = (value: MissionTypeMap[K] | null) => void

type UpdateByFunction<K extends keyof MissionTypeMap> = (cb: (
  oldData: MissionTypeMap[K],
  setter: (newData: MissionTypeMap[K] | null) => void
) => void) => void

const cache = {
  data: {} as Record<MissionTypeKey, ShallowRef<MissionTypeValue>>,
  isEmpty: {} as Record<MissionTypeKey, ComputedRef<boolean>>,
  isEnable: {} as Record<MissionTypeKey, ComputedRef<boolean>>,
  isProcessing: {} as Record<MissionTypeKey, ComputedRef<boolean>>,
  clearEventHook: {} as Record<MissionTypeKey, EventHook<void>>,
  unsubscribe: {} as Record<MissionTypeKey, () => void>,
  updateCache: {} as Record<MissionTypeKey, unknown>,
  updateByCache: {} as Record<MissionTypeKey, unknown>,
  clearCache: {} as Record<MissionTypeKey, () => void>,
}
// ============================== ↑ 共享地址而不是使用闭包，以避免订阅过多时导致的卡顿问题 ↑ ==============================

export const useMapMission = () => {
  const mission = shallowRef<Mission | null>(null)

  /** 仅限不关注任务类型的情况下调用 */
  const setMission = (newMission: Mission | null) => {
    mission.value = newMission
  }

  /** 关注某一任务类型的情况下，必须通过该 API 进行任务更新操作 */
  const subscribeMission = <K extends keyof MissionTypeMap>(type: K, getDefaultValue: () => MissionTypeMap[K]) => {
    const data = ensureFrom(cache.data, type, () => shallowRef(getDefaultValue())) as ShallowRef<MissionTypeMap[K]>

    /** 是否空闲 */
    const isEmpty = ensureFrom(cache.isEmpty, type, () => computed(() => !mission.value))

    /** 是否可以进行任务设置（包括任务为空） */
    const isEnable = ensureFrom(cache.isEnable, type, () => computed(() => !mission.value || mission.value.type === type))

    /** 是否正在处理指定为 type 类型的任务 */
    const isProcessing = ensureFrom(cache.isProcessing, type, () => computed(() => mission.value?.type === type))

    const clearEventHook = ensureFrom(cache.clearEventHook, type, () => createEventHook<void>())

    const unsubscribe = ensureFrom(cache.unsubscribe, type, () => watch(mission, (newMission) => {
      if (newMission?.type !== type) {
        data.value = getDefaultValue()
        return
      }
      data.value = newMission.value as MissionTypeMap[K]
    }, { deep: true, immediate: true }))

    tryOnUnmounted(() => unsubscribe())

    const update = ensureFrom(cache.updateCache, type, () => (value: MissionTypeMap[K] | null) => {
      if (!mission.value || mission.value.type === type) {
        if (value === null) {
          mission.value = null
          clearEventHook.trigger()
          return
        }
        mission.value = { type, value } as Mission
      }
    }) as UpdateFunction<K>

    /** 有时候需要在确保某种类型的任务更新后才执行某些操作 */
    const updateBy = ensureFrom(cache.updateByCache, type, () => (cb: (oldData: MissionTypeMap[K], setter: (newData: MissionTypeMap[K] | null) => void) => void) => {
      if (mission.value?.type !== type)
        return
      cb(data.value as MissionTypeMap[K], (newData) => {
        update(newData)
      })
    }) as UpdateByFunction<K>

    const clear = ensureFrom(cache.clearCache, type, () => () => {
      if (mission.value?.type !== type)
        return
      mission.value = null
      clearEventHook.trigger()
    })

    return {
      isEmpty,
      isEnable,
      isProcessing,
      data,
      unsubscribe,
      update,
      updateBy,
      clear,
      onClear: clearEventHook.on,
    }
  }

  return {
    mission,
    setMission,
    subscribeMission,
  }
}
