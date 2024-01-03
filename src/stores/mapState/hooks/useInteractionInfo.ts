import type { ShallowRef } from 'vue'
import type { GSMapState } from '@/stores/types/genshin-map-state'

export const useInteractionInfo = () => {
  const hover = shallowRef<GSMapState.InteractionInfo | null>(null)
  const focus = shallowRef<GSMapState.InteractionInfo | null>(null)

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
      if (!state.value) {
        setInteractionInfo(interactionType, value === null ? null : { type: infoType, value } as GSMapState.InteractionInfo)
        return
      }
      if (state.value.type !== infoType)
        return
      setInteractionInfo(interactionType, value === null ? null : { type: infoType, value } as GSMapState.InteractionInfo)
    }

    return {
      data,
      update,
    }
  }

  return {
    hover: hover as Readonly<ShallowRef<GSMapState.InteractionInfo | null>>,
    focus: focus as Readonly<ShallowRef<GSMapState.InteractionInfo | null>>,
    setInteractionInfo,
    subscribeInteractionInfo,
  }
}
