import { useAreaStore, useItemStore, useMapStateStore, useTileStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { createRenderMarkers } from '@/stores/utils'

/** 点位 focus 状态管理 hook */
export const useMarkerFocus = () => {
  const mapStateStore = useMapStateStore()
  const areaStore = useAreaStore()
  const itemStore = useItemStore()
  const tileStore = useTileStore()

  /** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
  const cachedMarkerVo = shallowRef<GSMapState.MarkerWithRenderConfig | null>(null)

  const { data: focus, update: updateFocus } = mapStateStore.subscribeInteractionInfo('focus', 'defaultMarker')

  const { update: updateHover } = mapStateStore.subscribeInteractionInfo('hover', 'defaultMarker')

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

  const focusMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig, delay = 0) => {
    const markerWithRender = normalizeMarker(markerVo)
    if (isInDelay.value)
      return markerWithRender
    delay > 0
      ? setTimeout(() => updateFocus(markerWithRender), delay)
      : updateFocus(markerWithRender)
    return markerWithRender
  }

  /** 与 focus 相反的行为 */
  const blur = () => updateFocus(null)

  const hoverMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig) => {
    const markerWithRender = normalizeMarker(markerVo)
    updateHover(markerWithRender)
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => updateHover(null)

  watch(focus, (currentFocusMarker) => {
    if (!currentFocusMarker)
      return
    cachedMarkerVo.value = currentFocusMarker
  })

  return { cachedMarkerVo, focus, focusMarker, blur, hoverMarker, out }
}
