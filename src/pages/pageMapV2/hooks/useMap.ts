import type { Ref } from 'vue'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'

const map = shallowRef<GenshinMap>()

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const baseLayerCode = computed({
    get: () => map.value?.baseLayer?.rawProps.code,
    set: v => map.value && (map.value.setBaseLayer(v)),
  })

  const showBorder = computed({
    get: () => map.value?.showBorder ?? false,
    set: v => map.value && (map.value.showBorder = v),
  })

  const showTag = computed({
    get: () => map.value?.showTag ?? false,
    set: v => map.value && (map.value.showTag = v),
  })

  const showTooltip = computed({
    get: () => map.value?.showTooltip ?? false,
    set: v => map.value && (map.value.showTooltip = v),
  })

  const logger = new Logger('[MapV2]')

  const initMap = () => {
    if (!canvasRef?.value || map.value)
      return

    const newMap = new GenshinMap({
      canvas: canvasRef.value,
    })

    newMap.ready.then((readyMap) => {
      logger.info('map is ready', readyMap)
      baseLayerCode.value = LAYER_CONFIGS[0].code
    })

    map.value = newMap
  }

  tryOnMounted(initMap)

  return { map, baseLayerCode, showBorder, showTag, showTooltip }
}
