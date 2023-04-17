import type { Ref } from 'vue'
import { useMap } from '@/pages/pageMapV2/hooks'

export const useMarkerDrawer = (canvasRef: Ref<HTMLCanvasElement | null>) => {
  const { map } = useMap()

  const hasBeenDragged = ref(false)

  useEventListener(canvasRef, 'pointerdown', () => {
    const stopListenMove = useEventListener('pointermove', () => {
      if (!map.value)
        return
      hasBeenDragged.value = true
      map.value.hover = null
    })
    useEventListener('pointerup', () => {
      stopListenMove()
    }, { once: true })
    if (!map.value?.hover)
      return
    map.value.active = map.value.hover
  })

  useEventListener(canvasRef, 'pointerup', () => {
    if (!map.value)
      return
    map.value.active = map.value.hover
  })

  useEventListener(canvasRef, 'click', () => {
    if (!map.value)
      return
    if (hasBeenDragged.value) {
      hasBeenDragged.value = false
      return
    }
    map.value.focus = map.value?.hover ?? null
  })
}
