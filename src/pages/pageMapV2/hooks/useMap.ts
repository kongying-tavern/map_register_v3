import type { Ref } from 'vue'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'

export type MapReadyCallbackFunction = (map: GenshinMap) => void

const logger = new Logger('地图')

const mapRef = shallowRef<GenshinMap>()

const initMap = async (canvas: HTMLCanvasElement) => {
  const newMap = await GenshinMap.create({ canvas })
  await newMap.ready
  mapRef.value = newMap
  logger.info('地图已准备就绪', newMap)
}

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  if (canvasRef) {
    onMounted(() => {
      if (!canvasRef.value)
        throw new Error('canvas 元素不存在')
      initMap(canvasRef.value)
    })

    onUnmounted(() => {
      mapRef.value?.finalize()
      mapRef.value = undefined
    })
  }

  return { instance: mapRef }
}
