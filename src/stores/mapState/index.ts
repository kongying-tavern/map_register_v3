import { defineStore } from 'pinia'
import {
  useInteractionInfo,
  useMapCursor,
  useMapMission,
  useMarkerAdvancedFilter,
  useMarkerBasicFilter,
  useMarkerFilter,
  useMarkerLink,
  useMarkers,
  useViewPort,
} from './hooks'
import {
  useArchiveStore,
  useAreaStore,
  useItemStore,
  useItemTypeStore,
  useMarkerLinkStore,
  useMarkerStore,
  useTileStore,
} from '@/stores'

/** 地图非持久化状态，此类状态会在页面刷新后消失 */
export const useMapStateStore = defineStore('global-map-state', () => {
  const archiveStore = useArchiveStore()
  const markerLinkStore = useMarkerLinkStore()
  const markerStore = useMarkerStore()
  const tileStore = useTileStore()
  const areaStore = useAreaStore()
  const itemTypeStore = useItemTypeStore()
  const itemStore = useItemStore()

  // ============================== 视口控制 ==============================
  const viewPortHook = useViewPort()

  // ============================== 地图指针 ==============================
  const cursorHook = useMapCursor()

  // ============================== 地图任务 ==============================
  const missionHook = useMapMission()

  // ============================== 地图交互 ==============================
  const interactionInfoHook = useInteractionInfo()

  // ============================== 地图点位 ==============================
  const markersHook = useMarkers({
    archiveStore,
    markerStore,
    tileStore,
    areaStore,
    itemTypeStore,
    itemStore,
  })

  // ============================== 点位关联 ==============================
  const markerLinkInfoHook = useMarkerLink({
    markerLinkStore,
    focusElements: interactionInfoHook.focusElements,
    currentMarkerIdMap: markersHook.currentMarkerIdMap,
    staticMarkerIds: markersHook.staticMarkerIds,
    setTempMarkers: markersHook.setTempMarkers,
  })

  // ============================== 点位过滤器 ==============================
  const markerFilterHookOptions = {
    archiveStore,
    areaStore,
    itemTypeStore,
    itemStore,
  }
  const markerBasicFilterHook = useMarkerBasicFilter(markerFilterHookOptions)
  const markerAdvancedFilterHook = useMarkerAdvancedFilter(markerFilterHookOptions)
  const markerFilterHook = useMarkerFilter(markerFilterHookOptions)

  return {
    ...viewPortHook,

    ...cursorHook,

    interaction: interactionInfoHook,

    ...markersHook,

    ...markerLinkInfoHook,

    ...markerBasicFilterHook,
    ...markerAdvancedFilterHook,
    ...markerFilterHook,

    ...missionHook,

  }
})
