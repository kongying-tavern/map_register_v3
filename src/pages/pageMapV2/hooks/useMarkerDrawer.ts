import type { PickingInfo } from '@deck.gl/core/typed'
import type { Ref } from 'vue'
import { useMap, useMarkerCollimator } from '@/pages/pageMapV2/hooks'

/** 当前被选中的点位 */
const focus = shallowRef<API.MarkerVo | null>(null)
/** 缓存的点位信息, 用于在关闭弹窗时保持信息，使动画显示状态平滑 */
const cachedMarkerVo = shallowRef<API.MarkerVo | null>(null)
/** 在触屏模式下，防止重复点击蒙层导致的抽屉还未展开就关闭问题，所记录的抽屉开启时间 */
const triggerTimestamp = ref(new Date().getTime())
/** 在触屏模式下，防止重复点击蒙层导致的抽屉还未展开就关闭问题，所需的等待时间 */
const BLUR_DEBOUNCE_TIME = 100

const isMarkerVo = (v: unknown): v is API.MarkerVo => {
  if (typeof v !== 'object' || v === null)
    return false
  return ['markerTitle', 'position', 'content', 'extra'].every(property => property in v)
}

export const useMarkerDrawer = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const { map, onMapReady } = useMap()

  const { collimatorVisible } = useMarkerCollimator()

  const focusMarker = (markerVo: API.MarkerVo | null = null) => {
    if (collimatorVisible.value)
      return
    markerVo && (cachedMarkerVo.value = markerVo)
    focus.value = markerVo
    triggerTimestamp.value = new Date().getTime()
    map.value?.stateManager.set('focus', markerVo)
  }

  const blur = async () => {
    if (collimatorVisible.value)
      return
    focus.value = null
    map.value?.stateManager.set('focus', null)
  }

  const handleMapClick = async (info: PickingInfo, ev: { srcEvent: Event }) => {
    if (!(ev.srcEvent instanceof PointerEvent) || ev.srcEvent.button !== 0)
      return
    isMarkerVo(info.object) ? focusMarker(info.object) : blur()
  }

  const visible = computed({
    get: () => Boolean(focus.value),
    set: v => !v && blur(),
  })

  const beforeClose = (done: () => void) => {
    const triggerTimeGap = new Date().getTime() - triggerTimestamp.value
    if (triggerTimeGap < BLUR_DEBOUNCE_TIME)
      return
    done()
  }

  if (canvasRef) {
    onMapReady(mapInstance => mapInstance.event.on('click', handleMapClick))

    onBeforeUnmount(() => {
      map.value?.event.off('click', handleMapClick)
    })
  }

  return { cachedMarkerVo, focus, visible, focusMarker, blur, beforeClose }
}
