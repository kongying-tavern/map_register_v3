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

  /** 当前被选中的点位 */
  const focus = computed(() => {
    if (!mapStateStore.focus)
      return
    const { type, value: marker } = mapStateStore.focus
    if (type !== 'defaultMarker')
      return
    if ('render' in marker)
      return marker as GSMapState.MarkerWithRenderConfig
    return createRenderMarkers([marker], {
      areaIdMap: areaStore.areaIdMap,
      itemIdMap: itemStore.itemIdMap,
      tileConfigs: tileStore.mergedTileConfigs,
    })[0]
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

  const focusMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig) => {
    const markerWithRender = normalizeMarker(markerVo)
    mapStateStore.setInteractionInfo('focus', {
      type: 'defaultMarker',
      value: markerWithRender,
    })
    return markerWithRender
  }

  /** 与 focus 相反的行为 */
  const blur = () => {
    mapStateStore.setInteractionInfo('focus', null)
  }

  const hoverMarker = (markerVo: API.MarkerVo | GSMapState.MarkerWithRenderConfig) => {
    const markerWithRender = normalizeMarker(markerVo)
    mapStateStore.setInteractionInfo('hover', {
      type: 'defaultMarker',
      value: markerWithRender,
    })
    return markerWithRender
  }

  /** 与 hover 相反的行为 */
  const out = () => {
    mapStateStore.setInteractionInfo('hover', null)
  }

  watch(focus, (currentFocusMarker) => {
    if (!currentFocusMarker)
      return
    cachedMarkerVo.value = currentFocusMarker
  })

  return { cachedMarkerVo, focus, focusMarker, blur, hoverMarker, out }
}
