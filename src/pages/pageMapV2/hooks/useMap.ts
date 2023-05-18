import type { Ref } from 'vue'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'
import { useArchiveStore } from '@/stores'
import { LAYER_CONFIGS } from '@/pages/pageMapV2/config'

export type MapReadyCallbackFunction = (map: GenshinMap) => void

const logger = new Logger('[MapV2]')

const map = shallowRef<GenshinMap>()

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

    // 设置底图
    await newMap.ready
    newMap.setBaseLayer(LAYER_CONFIGS[0].code)
    map.value = newMap
    logger.info('map is ready', newMap)

    // 注册在地图创建以前生成的事件监听器
    tempCallbackSet.value.forEach(cb => cb(newMap))
    tempCallbackSet.value.clear()

    // 加载存档
    const archiveStore = useArchiveStore()
    await archiveStore.fetchArchive()
    archiveStore.loadLatestArchive()
  }

  canvasRef && onMounted(initMap)

  return { map, onMapReady }
}
