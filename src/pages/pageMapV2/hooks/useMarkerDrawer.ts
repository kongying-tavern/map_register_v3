import type { PickingInfo } from '@deck.gl/core/typed'
import type { Ref } from 'vue'
import { useMap } from '@/pages/pageMapV2/hooks'

const focus = shallowRef<API.MarkerVo | null>(null)
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

  const focusMarker = (markerVo: API.MarkerVo | null = null) => {
    focus.value = markerVo
    triggerTimestamp.value = new Date().getTime()
    map.value?.stateManager.set('focus', markerVo)
  }

  const handleMapClick = async (info: PickingInfo, ev: { srcEvent: Event }) => {
    if (!(ev.srcEvent instanceof PointerEvent) || ev.srcEvent.button !== 0)
      return
    focusMarker(isMarkerVo(info.object) ? info.object : null)
  }

  const blur = async () => {
    focus.value = null
    map.value?.stateManager.set('focus', null)
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

  return { focus, visible, focusMarker, blur, beforeClose }
}
