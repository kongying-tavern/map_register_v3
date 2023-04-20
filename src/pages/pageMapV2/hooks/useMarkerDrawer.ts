import type { PickingInfo } from '@deck.gl/core/typed'
import type { Ref } from 'vue'
import type { MarkerWithExtra } from '../core'
import { useMap } from '@/pages/pageMapV2/hooks'

const focus = shallowRef<MarkerWithExtra | null>(null)
const triggerTimestamp = ref(new Date().getTime())

const isMarkerVo = (v: unknown): v is MarkerWithExtra => {
  if (typeof v !== 'object' || v === null)
    return false
  return ['markerTitle', 'position', 'content', 'extraObject'].every(property => property in v)
}

export const useMarkerDrawer = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const { map } = useMap()

  const handleMapClick = (info: PickingInfo, ev: { srcEvent: Event }) => {
    if (!(ev.srcEvent instanceof PointerEvent) || ev.srcEvent.button !== 0)
      return
    triggerTimestamp.value = new Date().getTime()
    focus.value = isMarkerVo(info.object) ? info.object : null
    map.value && (map.value.focus = focus.value)
  }

  const blur = () => {
    const current = new Date().getTime()
    if (current - triggerTimestamp.value < 20)
      return
    focus.value = null
    map.value && (map.value.focus = focus.value)
  }

  canvasRef && onMounted(async () => {
    await nextTick()
    map.value && (map.value.event.on('click', handleMapClick))
  })

  canvasRef && onBeforeUnmount(async () => {
    await nextTick()
    map.value && (map.value.event.off('click', handleMapClick))
  })

  canvasRef && useEventListener(canvasRef, 'pointerdown', () => {
    map.value && (map.value.active = map.value.hover)
  })

  canvasRef && useEventListener('pointerup', () => {
    map.value && (map.value.active = null)
  })

  return { focus, blur }
}
