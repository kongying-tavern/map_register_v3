import type { ShallowRef } from 'vue'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { useState } from '@/hooks'
import { ensureFrom } from '@/utils'

// ============================== ↓ 共享地址而不是使用闭包，以避免订阅过多时导致的卡顿问题 ↓ ==============================
type InteractionKey = keyof GSMapState.InteractionTypeMap
type InteractionValue = GSMapState.InteractionTypeMap[InteractionKey]

const cache = {
  data: {
    hover: {} as Record<InteractionKey, ComputedRef<unknown>>,
    focus: {} as Record<InteractionKey, ComputedRef<unknown>>,
  },
  update: {
    hover: {} as Record<InteractionKey, (value: InteractionValue | null) => void>,
    focus: {} as Record<InteractionKey, (value: InteractionValue | null) => void>,
  },
  pause: {
    hover: {} as Record<InteractionKey, () => void>,
    focus: {} as Record<InteractionKey, () => void>,
  },
  resume: {
    hover: {} as Record<InteractionKey, () => void>,
    focus: {} as Record<InteractionKey, () => void>,
  },
}
// ============================== ↑ 共享地址而不是使用闭包，以避免订阅过多时导致的卡顿问题 ↑ ==============================

export const useInteractionInfo = () => {
  const hover = shallowRef<GSMapState.InteractionInfo | null>(null)
  const focus = shallowRef<GSMapState.InteractionInfo | null>(null)

  /** 某种类型的交互是否处于暂停状态 */
  const isPaused = reactive<{
    hover: Partial<Record<keyof GSMapState.InteractionTypeMap, boolean>>
    focus: Partial<Record<keyof GSMapState.InteractionTypeMap, boolean>>
  }>({
    hover: {},
    focus: {},
  })

  /** 是否在 hover 时触发点位弹窗，启用时 focus 状态将不会触发弹窗 */
  const [isPopoverOnHover, setIsPopoverOnHover] = useState(false)

  const setInteractionInfo = (interactionType: 'hover' | 'focus', info: GSMapState.InteractionInfo | null) => {
    const state = { hover, focus }[interactionType]
    state.value = info
  }

  const subscribeInteractionInfo = <K extends keyof GSMapState.InteractionTypeMap>(interactionType: 'hover' | 'focus', infoType: K) => {
    const state = { hover, focus }[interactionType]

    const data = ensureFrom(cache.data[interactionType], infoType, () => computed(() => {
      if (state.value?.type !== infoType)
        return null
      return state.value.value
    })) as ComputedRef<GSMapState.InteractionTypeMap[K]>

    const update = ensureFrom(cache.update[interactionType], infoType, () => ((value: GSMapState.InteractionTypeMap[K] | null) => {
      if (isPaused[interactionType][infoType])
        return
      if (!state.value) {
        setInteractionInfo(interactionType, value === null ? null : { type: infoType, value } as GSMapState.InteractionInfo)
        return
      }
      if (state.value.type !== infoType)
        return
      setInteractionInfo(interactionType, value === null ? null : { type: infoType, value } as GSMapState.InteractionInfo)
    }) as (value: InteractionValue | null) => void)

    /** 暂停该类型交互的触发 */
    const pause = ensureFrom(cache.pause[interactionType], infoType, () => () => {
      isPaused[interactionType][infoType] = true
    })

    /** 重新开始该类型交互的触发 */
    const resume = ensureFrom(cache.pause[interactionType], infoType, () => () => {
      isPaused[interactionType][infoType] = false
    })

    return {
      data,
      update,
      pause,
      resume,
    }
  }

  return {
    hover: hover as Readonly<ShallowRef<GSMapState.InteractionInfo | null>>,
    focus: focus as Readonly<ShallowRef<GSMapState.InteractionInfo | null>>,
    setInteractionInfo,
    subscribeInteractionInfo,

    isPopoverOnHover: isPopoverOnHover as Readonly<Ref<boolean>>,
    setIsPopoverOnHover,
  }
}
