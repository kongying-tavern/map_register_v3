import { TRANSITION_EVENTS } from '@deck.gl/core'
import type { ShallowRef } from 'vue'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { TRANSITION } from '@/pages/pageMapV2/shared'
import type { usePreferenceStore } from '@/stores'
import type { EventBus } from '@/utils'
import type { GSMap } from '@/pages/pageMapV2/types/map'

interface ViewStateHookOptions {
  event: EventBus<GSMap.EventMap>
  preferenceStore: ReturnType<typeof usePreferenceStore>
}

export const useViewState = (options: ViewStateHookOptions) => {
  const { event, preferenceStore } = options

  const viewState = ref<GSMapState.ViewState>({
    zoom: -4,
    minZoom: -4,
    maxZoom: 2,
    target: [0, 0],
    transitionDuration: 150,
    transitionEasing: TRANSITION.LINEAR,
    transitionInterruption: TRANSITION_EVENTS.BREAK,
  })

  event.on('viewStateChange', ({ viewState: newViewState }) => {
    Object.assign(viewState.value, newViewState)
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

  /** 设置是否锁定视口变化 */
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
