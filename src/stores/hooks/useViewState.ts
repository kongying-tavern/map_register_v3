import { TRANSITION_EVENTS } from '@deck.gl/core/typed'
import type { ShallowRef } from 'vue'
import type { GSMapState } from '../types/genshin-map-state'
import { TRANSITION } from '@/pages/pageMapV2/shared'
import { usePreferenceStore } from '@/stores'

export const useViewState = () => {
  const preferenceStore = usePreferenceStore()

  const viewState = shallowRef<GSMapState.ViewState>({
    maxRotationX: 90,
    minRotationX: -90,
    rotationX: 0,
    rotationOrbit: 0,
    zoom: -4,
    minZoom: -4,
    maxZoom: 2,
    target: [0, 0],
    transitionDuration: 150,
    transitionEasing: TRANSITION.LINEAR,
    transitionInterruption: TRANSITION_EVENTS.BREAK,
  })

  const setViewState = (state: Partial<GSMapState.ViewState>) => {
    const { minZoom, maxZoom, target, zoom } = viewState.value
    viewState.value = {
      minZoom,
      maxZoom,
      target,
      zoom,
      ...state,
    }
  }

  const isViewPortChanging = autoResetRef(false, 50)
  watch(viewState, () => {
    if (!preferenceStore.preference['map.setting.pauseViewChangingPicking'])
      return
    isViewPortChanging.value = true
  })

  const isViewPortLocked = ref(false)

  const setViewPortLocked = (v: boolean) => {
    isViewPortLocked.value = v
  }

  return {
    viewState: viewState as Readonly<ShallowRef<GSMapState.ViewState>>,
    isViewPortChanging: isViewPortChanging as Readonly<Ref<boolean>>,
    setViewState,

    isViewPortLocked: isViewPortLocked as Readonly<Ref<boolean>>,
    setViewPortLocked,
  }
}
