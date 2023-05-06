import type { Ref } from 'vue'
import type { GenshinMapState } from '@/pages/pageMapV2/core'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'

export type MapReadyCallbackFunction = (map: GenshinMap) => void

const logger = new Logger('[MapV2]')

const map = shallowRef<GenshinMap>()

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
const showOverlay = useGenshinMapStateRef('showOverlay', false)

/** 在地图初始化前临时存储回调函数 */
const tempCallbackSet = shallowRef(new Set<MapReadyCallbackFunction>())

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  const onMapReady = (cb: MapReadyCallbackFunction) => {
    if (!map.value) {
      tempCallbackSet.value.add(cb)
      return
    }
    cb(map.value)
  }

  const initMap = async () => {
    if (!canvasRef?.value || map.value)
      return

    const newMap = await GenshinMap.create({ canvas: canvasRef.value })

    Object.keys(newMap.stateManager.state).forEach((property) => {
      newMap.stateManager.registerEffect(property as keyof GenshinMapState, target => target.baseLayer?.forceUpdate())
    })

    await newMap.ready
    newMap.setBaseLayer(LAYER_CONFIGS[0].code)

    map.value = newMap
    logger.info('map is ready', newMap)

    tempCallbackSet.value.forEach(cb => cb(newMap))
    tempCallbackSet.value.clear()
  }

  canvasRef && onMounted(initMap)

  return { map, showBorder, showTag, showTooltip, showOverlay, onMapReady }
}
