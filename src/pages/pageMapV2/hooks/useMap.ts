import type { Ref } from 'vue'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { Logger } from '@/utils'

export type MapReadyCallbackFunction = (map: GenshinMap) => void

const logger = new Logger('[地图 Hook]')

const map = shallowRef<GenshinMap>()

/** 在地图初始化前临时存储回调函数 */
const tempCallbackSet = shallowRef(new Set<MapReadyCallbackFunction>())

const onMapReady = (cb: MapReadyCallbackFunction) => {
  if (!map.value) {
    tempCallbackSet.value.add(cb)
    return
  }
  cb(map.value)

  onScopeDispose(() => {
    tempCallbackSet.value.delete(cb)
  })
}

const initMap = async (canvas: HTMLCanvasElement) => {
  const newMap = await GenshinMap.create({ canvas })

  // 设置底图
  await newMap.ready
  map.value = newMap
  logger.info('地图已准备就绪', newMap)

  // 注册在地图创建以前生成的事件监听器
  tempCallbackSet.value.forEach(cb => cb(newMap))
  tempCallbackSet.value.clear()
}

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  canvasRef && onMounted(() => canvasRef.value && initMap(canvasRef.value))
  return { map, onMapReady }
}
