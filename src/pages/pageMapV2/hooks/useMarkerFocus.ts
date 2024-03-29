import { useAreaStore, useItemStore, useMapStateStore, usePreferenceStore, useTileStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'

/** 点位 focus 状态管理 hook */
export const _useMarkerFocus = () => {
  const preferenceStore = usePreferenceStore()
  const mapStateStore = useMapStateStore()
  const areaStore = useAreaStore()
  const itemStore = useItemStore()
  const tileStore = useTileStore()

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerVo = shallowRef<GSMapState.MarkerWithRenderConfig | null>(null)

  const { data: focus, update: updateFocus } = mapStateStore.subscribeInteractionInfo('focus', 'defaultMarker')

  const { data: hover, update: updateHover } = mapStateStore.subscribeInteractionInfo('hover', 'defaultMarker')

  mapStateStore.event.on('click', (info) => {
    if (info.object)
      return
    updateHover(null)
    updateFocus(null)
  })

  const isPopoverActived = computed(() => {
    if (preferenceStore.preference['map.setting.hideMarkerPopover'])
      return false
    return Boolean(mapStateStore.isPopoverOnHover
      ? hover.value
      : focus.value,
    )
  })

  const normalizeMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig): GSMapState.MarkerWithRenderConfig => {
    return 'render' in markerVo
      ? markerVo
      : createRenderMarkers([markerVo], {
        areaIdMap: areaStore.areaIdMap,
        itemIdMap: itemStore.itemIdMap,
        tileConfigs: tileStore.mergedTileConfigs,
      })[0]
  }

  const isInDelay = ref(false)

  /** 与 focus 相反的行为 */
  const blur = () => {
    mapStateStore.setTempMarkers('focus', [])
    updateFocus(null)
  }

  const focusMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig, delay = 0) => {
    blur()
    const markerWithRender = normalizeMarker(markerVo)
    if (isInDelay.value)
      return markerWithRender
    if (delay > 0)
      isInDelay.value = true
    delay > 0
      ? setTimeout(() => {
        updateFocus(markerWithRender)
        isInDelay.value = false
      }, delay)
      : updateFocus(markerWithRender)
    return markerWithRender
  }

  const hoverMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig) => {
    const markerWithRender = normalizeMarker(markerVo)
    updateHover(markerWithRender)
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => updateHover(null)

  watch(() => [focus.value, hover.value, mapStateStore.isPopoverOnHover] as const, ([currentFocus, currentHover, isPopoverOnHover]) => {
    const target = isPopoverOnHover ? currentHover : currentFocus
    if (!target) {
      mapStateStore.setTempMarkers('focus', [])
      return
    }
    cachedMarkerVo.value = target
    mapStateStore.setTempMarkers('focus', [target])
  })

  return {
    isPopoverActived,
    cachedMarkerVo,
    focus,
    focusMarker,
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
