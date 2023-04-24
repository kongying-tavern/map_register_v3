import type { Ref } from 'vue'
import type { GenshinMapState } from '@/pages/pageMapV2/core'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'

const logger = new Logger('[MapV2]')

const map = shallowRef<GenshinMap>()

let resolver: (map: GenshinMap) => void
const ensureMap = new Promise<GenshinMap>((resolve) => {
  resolver = resolve
})

const useGenshinMapStateRef = <K extends keyof GenshinMapState>(key: K, defaluValue: GenshinMapState[K]) => computed({
  get: () => map.value?.stateManager.get(key) ?? defaluValue,
  set: (v) => {
    map.value?.stateManager.set(key, v)
    triggerRef(map)
  },
})

const showBorder = useGenshinMapStateRef('showBorder', false)
const showTag = useGenshinMapStateRef('showTags', true)
const showTooltip = useGenshinMapStateRef('showTooltip', true)
const showUndergroundLayer = useGenshinMapStateRef('showUndergroundLayer', false)

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const initMap = async () => {
    if (!canvasRef?.value || map.value)
      return

    const newMap = new GenshinMap({ canvas: canvasRef.value })

    Object.keys(newMap.stateManager.state).forEach((property) => {
      newMap.stateManager.registerEffect(property as keyof GenshinMapState, target => target.baseLayer?.forceUpdate())
    })

    newMap.ready.then((readyMap) => {
      logger.info('map is ready', readyMap)
      readyMap.setBaseLayer(LAYER_CONFIGS[0].code)
    })

    map.value = newMap
    resolver(newMap)
  }

  tryOnMounted(initMap)

  return { map, showBorder, showTag, showTooltip, showUndergroundLayer, ensureMap }
}
