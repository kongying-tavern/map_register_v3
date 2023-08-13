import type { Ref } from 'vue'
import { useMap, useMarkerCollimator } from '@/pages/pageMapV2/hooks'

/** 当前被选中的点位 */
const focus = shallowRef<API.MarkerVo | null>(null)
/** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
const cachedMarkerVo = shallowRef<API.MarkerVo | null>(null)

const isMarkerVo = (v: unknown): v is API.MarkerVo => {
  if (typeof v !== 'object' || v === null)
    return false
  return ['markerTitle', 'position', 'itemList'].every(property => property in v)
}

/** 点位 focus 状态管理 hook */
export const useMarkerFocus = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const { map, onMapReady } = useMap()

  const { collimatorVisible } = useMarkerCollimator()

  const setFocus = (markerVo: API.MarkerVo | null = null) => {
    cachedMarkerVo.value = markerVo
    focus.value = markerVo
    map.value?.stateManager.set('focus', markerVo)
  }

  const focusMarker = (markerVo: API.MarkerVo | null = null) => {
    if (collimatorVisible.value)
      return
    setFocus(markerVo)
  }

  const blur = async () => {
    if (collimatorVisible.value)
      return
    focus.value = null
    map.value?.stateManager.set('focus', null)
  }

  canvasRef && onMapReady(mapInstance => mapInstance.event.on('click', (info, ev) => {
    if (!ev.leftButton || !isMarkerVo(info.object))
      return blur()
    focusMarker(info.object)
  }))

  return { cachedMarkerVo, focus, focusMarker, blur, setFocus }
}
