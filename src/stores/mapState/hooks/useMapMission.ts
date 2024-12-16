import type { ComputedRef } from 'vue'
import type { EventHookOn } from '@vueuse/core'
import type {
  Mission,
  MissionTypeMap,
} from '@/packages/map'

// ============================== ↓ 共享地址而不是使用闭包，以避免订阅过多时导致的卡顿问题 ↓ ==============================
type MissionTypeKey = keyof MissionTypeMap

type UpdateFunction<K extends MissionTypeKey> = (value: MissionTypeMap[K] | null) => void

type UpdateByFunction<K extends MissionTypeKey> = (cb: (
  oldData: MissionTypeMap[K],
  setter: (newData: MissionTypeMap[K] | null) => void
) => void) => void

interface MissionSubscriber<K extends MissionTypeKey> {
  isEmpty: Readonly<Ref<boolean>>
  isEnable: Readonly<Ref<boolean>>
  isProcessing: Readonly<Ref<boolean>>
  data: Ref<MissionTypeMap[K]>
  update: UpdateFunction<K>
  updateBy: UpdateByFunction<K>
  clear: () => void
  onClear: EventHookOn<void>
}

// ============================== ↑ 共享地址而不是使用闭包，以避免订阅过多时导致的卡顿问题 ↑ ==============================

export const useMapMission = () => {
  const mission = ref<Mission | null>(null)

  const cache = shallowRef(new Map<string, unknown>())

  /** 仅限不关注任务类型的情况下调用 */
  const setMission = (newMission: Mission | null) => {
    mission.value = newMission
  }

  /** 关注某一任务类型的情况下，必须通过该 API 进行任务更新操作 */
  const subscribeMission = <K extends MissionTypeKey>(type: K, getDefaultValue: () => MissionTypeMap[K]): MissionSubscriber<K> => {
    if (!cache.value.has(type)) {
      cache.value.set(type, (() => {
        const data = computed(() => {
          if (mission.value?.type !== type)
            return getDefaultValue()
          return mission.value.value
        }) as ComputedRef<MissionTypeMap[K]>

        const isEmpty = computed(() => !mission.value)
        /** 是否可以进行任务设置（包括任务为空） */
        const isEnable = computed(() => !mission.value || mission.value.type === type)

        /** 是否正在处理指定为 type 类型的任务 */
        const isProcessing = computed(() => mission.value?.type === type)

        const clearEventHook = createEventHook<void>()

        const update: UpdateFunction<K> = (value: MissionTypeMap[K] | null) => {
          if (mission.value && mission.value.type !== type)
            return
          if (value === null) {
            mission.value = null
            clearEventHook.trigger()
            return
          }
          mission.value = { type, value } as Mission
        }

        /** 有时候需要在确保某种类型的任务更新后才执行某些操作 */
        const updateBy: UpdateByFunction<K> = (cb: (oldData: MissionTypeMap[K], setter: (newData: MissionTypeMap[K] | null) => void) => void) => {
          if (mission.value?.type !== type)
            return
          cb(data.value as MissionTypeMap[K], (newData) => {
            update(newData)
          })
        }

        const clear = () => {
          if (mission.value?.type !== type)
            return
          mission.value = null
          clearEventHook.trigger()
        }

        return {
          isEmpty,
          isEnable,
          isProcessing,
          data,
          update,
          updateBy,
          clear,
          onClear: clearEventHook.on,
        }
      })())
    }
    return cache.value.get(type)! as MissionSubscriber<K>
  }

  return {
    mission,
    setMission,
    subscribeMission,
  }
}
