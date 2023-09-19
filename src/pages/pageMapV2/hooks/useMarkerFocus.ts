import type { Ref } from 'vue'
import { useMap } from '@/pages/pageMapV2/hooks'
import { isMarkerVo } from '@/utils'
import { useMapStore } from '@/stores'

/** 当前被选中的点位 */
const focus = shallowRef<API.MarkerVo | null>(null)
/** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
const cachedMarkerVo = shallowRef<API.MarkerVo | null>(null)

/** 点位 focus 状态管理 hook */
export const useMarkerFocus = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const { onMapReady } = useMap()
  const mapStore = useMapStore()

  const focusMarker = (markerVo: API.MarkerVo) => {
    cachedMarkerVo.value = markerVo
    focus.value = markerVo
    mapStore.setFocus('marker', markerVo)
  }

  const blur = async () => {
    focus.value = null
    mapStore.clear('focus')
  }

  canvasRef && onMapReady(mapInstance => mapInstance.event.on('click', (info, ev) => {
    if (!ev.leftButton || !isMarkerVo(info.object))
      return blur()
    focusMarker(info.object)
  }))

  return { cachedMarkerVo, focus, focusMarker, blur }
}
