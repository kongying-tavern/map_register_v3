import type { ShallowRef } from 'vue'
import type { GSMapState } from '../types/genshin-map-state'

const strategy: {
  [K in keyof GSMapState.InteractionTypeMap]: {
    isEqual: (a: GSMapState.InteractionTypeMap[K], b: GSMapState.InteractionTypeMap[K]) => boolean
  }
} = {
  defaultMarker: {
    isEqual: (a, b) => a.id === b.id,
  },
}

export const useInteractionInfo = () => {
  const hover = shallowRef<GSMapState.InteractionInfo | null>(null)
  const focus = shallowRef<GSMapState.InteractionInfo | null>(null)

  const setInteractionInfo = (interactionType: 'hover' | 'focus', info: GSMapState.InteractionInfo | null) => {
    const state = { hover, focus }[interactionType]
    const oldInfo = state.value
    if (!oldInfo && !info)
      return
    if (oldInfo && info && oldInfo.type === info.type && strategy[info.type].isEqual(oldInfo.value, info.value))
      return
    state.value = info
  }

  return {
    hover: hover as Readonly<ShallowRef<GSMapState.InteractionInfo | null>>,
    focus: focus as Readonly<ShallowRef<GSMapState.InteractionInfo | null>>,
    setInteractionInfo,
  }
}
