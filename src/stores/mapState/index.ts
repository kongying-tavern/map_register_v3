import { defineStore } from 'pinia'
import { useInteractionInfo, useMapMission, useMarkes, useViewState } from './hooks'

/** 地图非持久化状态，此类状态会在页面刷新后消失 */
export const useMapStateStore = defineStore('global-map-state', () => {
  // ============================== 地图视口状态 ==============================
  const viewStateHook = useViewState()

  // ============================== 地图交互状态 ==============================
  const interactionInfoHook = useInteractionInfo()

  // ============================== 地图点位状态 ==============================
  const markersHook = useMarkes()

  // ==============================   地图任务   ==============================
  const missionHook = useMapMission()

  return {
    ...viewStateHook,

    ...interactionInfoHook,

    ...markersHook,

    ...missionHook,
  }
})
