import { useAreaStore, useItemStore, useMapStateStore, usePreferenceStore, useTileStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'
import { EaseoutInterpolator } from '@/pages/pageMapV2/core/interpolator'

/** 点位 focus 状态管理 hook */
export const _useMarkerFocus = () => {
  const preferenceStore = usePreferenceStore()
  const mapStateStore = useMapStateStore()
  const areaStore = useAreaStore()
  const itemStore = useItemStore()
  const tileStore = useTileStore()

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerVo = shallowRef<GSMapState.MarkerWithRenderConfig | null>(null)

  const { hasFocus, hasHover, addFocus, addHover, removeFocus, removeHover } = mapStateStore

  const updateFocus = (id?: number) => {
    return addFocus('marker', id, true)
  }

  mapStateStore.event.on('click', (info) => {
    if (info.object)
      return
    removeHover('marker')
    removeFocus('marker')
  })

  const focus = computed(() => {
    if (preferenceStore.preference['map.setting.hideMarkerPopover'])
      return
    if (mapStateStore.isPopoverOnHover) {
      if (!hasHover('marker'))
        return undefined
      const hoverIds = mapStateStore.hoverElements.get('marker')
      if (!hoverIds || hoverIds.size > 1)
        return
      const markerId = hoverIds.values().next().value
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
    else {
      if (!hasFocus('marker'))
        return undefined
      const focusIds = mapStateStore.focusElements.get('marker')
      if (!focusIds || focusIds.size > 1)
        return
      const markerId = focusIds.values().next().value
      return mapStateStore.currentMarkerIdMap.get(markerId)
    }
  })

  const isPopoverActived = computed(() => focus.value !== undefined)

  const normalizeMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig): GSMapState.MarkerWithRenderConfig => {
    return 'render' in markerVo
      ? markerVo
      : createRenderMarkers([markerVo], {
        areaIdMap: areaStore.areaIdMap,
        itemIdMap: itemStore.itemIdMap,
        tileConfigs: tileStore.mergedTileConfigs,
      })[0]
  }

  const updateLoading = ref(false)

  const delayTimer = ref<number>()

  /** 与 focus 相反的行为 */
  const blur = () => {
    mapStateStore.setTempMarkers('focus', [])
    removeFocus('marker')
  }

  const focusMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig, {
    delay = 0,
    flyToMarker = false,
  }: {
    delay?: number
    flyToMarker?: boolean
  }) => {
    blur()
    window.clearTimeout(delayTimer.value)
    const markerWithRender = normalizeMarker(markerVo)

    if (delay > 0) {
      delayTimer.value = window.setTimeout(() => {
        addFocus('marker', markerWithRender.id, true)
        delayTimer.value = undefined
      }, delay)
    }
    else {
      addFocus('marker', markerWithRender.id, true)
    }

    if (flyToMarker) {
      const { render: { position: [x, y] } } = markerWithRender
      mapStateStore.event.emit('setViewState', {
        target: [x, y],
        zoom: 0,
        transitionDuration: delay,
        transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
      })
    }

    return markerWithRender
  }

  const hoverMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig | null) => {
    if (!markerVo) {
      removeHover('marker')
      return
    }
    const markerWithRender = normalizeMarker(markerVo)
    addHover('marker', markerWithRender.id)
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => removeHover('marker')

  watch(() => [focus.value, mapStateStore.isPopoverOnHover] as const, ([currentFocus, isPopoverOnHover]) => {
    if (!currentFocus) {
      !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [])
      return
    }
    cachedMarkerVo.value = currentFocus
    !isPopoverOnHover && mapStateStore.setTempMarkers('focus', [currentFocus])
  })

  return {
    isPopoverActived,
    cachedMarkerVo,
    focus,
    updateLoading,
    normalizeMarker,
    focusMarker,
    updateFocus,
    blur,
    hoverMarker,
    out,
  }
}

let cache: ReturnType<typeof _useMarkerFocus>

export const useMarkerFocus = () => {
  if (!cache)
    cache = _useMarkerFocus()
  return cache
}
