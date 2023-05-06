import type { PickingInfo } from '@deck.gl/core/typed'
import type { Ref } from 'vue'
import type { MarkerWithExtra } from '../core'
import { useMap } from '@/pages/pageMapV2/hooks'

const focus = shallowRef<MarkerWithExtra | null>(null)
const triggerTimestamp = ref(new Date().getTime())
/** 在触屏模式下，防止重复点击蒙层导致的抽屉还未展开就关闭问题，所需的等待时间 */
const BLUR_DEBOUNCE_TIME = 100

const isMarkerVo = (v: unknown): v is MarkerWithExtra => {
  if (typeof v !== 'object' || v === null)
    return false
  return ['markerTitle', 'position', 'content', 'extraObject'].every(property => property in v)
}

export const useMarkerDrawer = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const { map, onMapReady } = useMap()

  const handleMapClick = async (info: PickingInfo, ev: { srcEvent: Event }) => {
    if (!(ev.srcEvent instanceof PointerEvent) || ev.srcEvent.button !== 0)
      return
    triggerTimestamp.value = new Date().getTime()
    focus.value = isMarkerVo(info.object) ? info.object : null
    map.value?.stateManager.set('focus', focus.value)
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

  return { focus, visible, blur, beforeClose }
}
