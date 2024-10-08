import type { ShallowRef } from 'vue'
import type { GenshinMapProps } from '../types'
import { GenshinMap } from '../genshinMap'

export const useGenshinMap = (
  canvasRef: ShallowRef<HTMLCanvasElement | undefined>,
  options: GenshinMapProps = {},
) => {
  const instanceRef = shallowRef<GenshinMap | null>(null)

  const finalize = () => {
    instanceRef.value?.finalize()
    instanceRef.value = null
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) {
      finalize()
      return
    }

    const instance = new GenshinMap(canvas, options)

    instanceRef.value = instance
  })

  onUnmounted(() => {
    finalize()
  })

  return {
    instanceRef,
  }
}
