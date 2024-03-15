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
  useViewState,
} from './hooks'
import {
  useAreaStore,
  useItemStore,
  useItemTypeStore,
  useMarkerLinkStore,
  useMarkerStore,
  usePreferenceStore,
  useTileStore,
} from '@/stores'
import type { GSMap } from '@/pages/pageMapV2/types/map'
import { EventBus } from '@/utils'

/** 地图非持久化状态，此类状态会在页面刷新后消失 */
export const useMapStateStore = defineStore('global-map-state', () => {
  const preferenceStore = usePreferenceStore()
  const markerLinkStore = useMarkerLinkStore()
  const markerStore = useMarkerStore()
  const tileStore = useTileStore()
  const areaStore = useAreaStore()
  const itemTypeStore = useItemTypeStore()
  const itemStore = useItemStore()

  // ============================== 地图事件 ==============================
  const event = new EventBus<GSMap.EventMap>()

  // ============================== 地图指针 ==============================
  const cursorHook = useMapCursor()

  // ============================== 地图视口 ==============================
  const viewStateHook = useViewState({
    preferenceStore,
  })

  // ============================== 地图任务 ==============================
  const missionHook = useMapMission()

  // ============================== 地图交互 ==============================
  const interactionInfoHook = useInteractionInfo()

  // ============================== 地图点位 ==============================
  const markersHook = useMarkers({
    preferenceStore,
    markerStore,
    tileStore,
    areaStore,
    itemTypeStore,
    itemStore,
  })

  // ============================== 点位关联 ==============================
  const markerLinkInfoHook = useMarkerLink({
    markerLinkStore,
    focus: interactionInfoHook.focus,
    staticMarkerIds: markersHook.staticMarkerIds,
    setTempMarkers: markersHook.setTempMarkers,
  })

  // ============================== 点位过滤器 ==============================
  const markerFilterHookOptions = {
    preferenceStore,
    areaStore,
    itemTypeStore,
    itemStore,
  }
  const markerBasicFilterHook = useMarkerBasicFilter(markerFilterHookOptions)
  const markerAdvancedFilterHook = useMarkerAdvancedFilter(markerFilterHookOptions)
  const markerFilterHook = useMarkerFilter(markerFilterHookOptions)

  return {
    event,

    ...viewStateHook,

    ...cursorHook,

    ...interactionInfoHook,

    ...markersHook,

    ...markerLinkInfoHook,

    ...markerBasicFilterHook,
    ...markerAdvancedFilterHook,
    ...markerFilterHook,

    ...missionHook,

  }
})
