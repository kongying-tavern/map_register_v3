import type { Ref } from 'vue'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'

const map = shallowRef<GenshinMap>()
const eventHook = createEventHook<GenshinMap>()

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
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

  const callbackSet = shallowRef(new Set<(map: GenshinMap) => void>())

  const onMapReady = (fn: (map: GenshinMap) => void) => {
    eventHook.on(fn)
    callbackSet.value.add(fn)
  }

  tryOnUnmounted(() => {
    callbackSet.value.forEach(cb => eventHook.off(cb))
  })

  const initMap = () => {
    if (!canvasRef?.value || map.value)
      return

    const newMap = new GenshinMap({
      canvas: canvasRef.value,
    })

    newMap.ready.then((readyMap) => {
      logger.info('map is ready', readyMap)
      readyMap.setBaseLayer(LAYER_CONFIGS[0].code)
    })

    map.value = newMap
  }

  tryOnMounted(initMap)

  return { map, showBorder, showTag, showTooltip, onMapReady }
}
