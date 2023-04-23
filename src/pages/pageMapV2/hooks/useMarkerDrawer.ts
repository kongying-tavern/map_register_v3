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
  const { ensureMap } = useMap()

  const handleMapClick = async (info: PickingInfo, ev: { srcEvent: Event }) => {
    if (!(ev.srcEvent instanceof PointerEvent) || ev.srcEvent.button !== 0)
      return
    const map = await ensureMap
    triggerTimestamp.value = new Date().getTime()
    focus.value = isMarkerVo(info.object) ? info.object : null
    map.stateManager.set('focus', focus.value)
  }

  const blur = async () => {
    const map = await ensureMap
    const current = new Date().getTime()
    if (current - triggerTimestamp.value < 20)
      return
    focus.value = null
    map.stateManager.set('focus', focus.value)
  }

  canvasRef && onMounted(async () => {
    const map = await ensureMap
    map.event.on('click', handleMapClick)
  })

  canvasRef && onBeforeUnmount(async () => {
    const map = await ensureMap
    map.event.off('click', handleMapClick)
  })

  canvasRef && useEventListener(canvasRef, 'pointerdown', async () => {
    const map = await ensureMap
    map.stateManager.set('active', map.stateManager.get('hover'))
  })

  canvasRef && useEventListener('pointerup', async () => {
    const map = await ensureMap
    map.stateManager.set('active', null)
  })

  return { focus, blur }
}
