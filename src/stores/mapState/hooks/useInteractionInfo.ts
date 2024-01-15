import type { ShallowRef } from 'vue'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { useState } from '@/hooks'

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

    const data = computed(() => {
      if (state.value?.type !== infoType)
        return null
      return state.value.value as GSMapState.InteractionTypeMap[K]
    })

    const update = (value: GSMapState.InteractionTypeMap[K] | null) => {
      if (isPaused[interactionType][infoType])
        return
      if (!state.value) {
        setInteractionInfo(interactionType, value === null ? null : { type: infoType, value } as GSMapState.InteractionInfo)
        return
      }
      if (state.value.type !== infoType)
        return
      setInteractionInfo(interactionType, value === null ? null : { type: infoType, value } as GSMapState.InteractionInfo)
    }

    /** 下一次变更交互对象 */
    const next = () => new Promise<GSMapState.InteractionTypeMap[K] | null>((resolve) => {
      const stop = watch(data, (target) => {
        stop()
        resolve(target)
      })
    })

    /** 暂停该类型交互的触发 */
    const pause = () => {
      isPaused[interactionType][infoType] = true
    }

    /** 重新开始该类型交互的触发 */
    const resume = () => {
      isPaused[interactionType][infoType] = false
    }

    return {
      data,
      update,
      next,
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
