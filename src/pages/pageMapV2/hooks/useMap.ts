import type { Ref } from 'vue'
import { GenshinMap } from '@/pages/pageMapV2/core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { Logger } from '@/utils'
import { useArchiveStore } from '@/stores'

export type MapReadyCallbackFunction = (map: GenshinMap) => void

const logger = new Logger('[MapV2]')

const map = shallowRef<GenshinMap>()

/** 在地图初始化前临时存储回调函数 */
const tempCallbackSet = shallowRef(new Set<MapReadyCallbackFunction>())

const onMapReady = (cb: MapReadyCallbackFunction) => {
  if (!map.value) {
    tempCallbackSet.value.add(cb)
    return
  }
  cb(map.value)
}

const initMap = async (canvas: HTMLCanvasElement) => {
  const newMap = await GenshinMap.create({ canvas })

  // 设置底图
  await newMap.ready
  map.value = newMap
  logger.info('map is ready', newMap)

  // 注册在地图创建以前生成的事件监听器
  tempCallbackSet.value.forEach(cb => cb(newMap))
  tempCallbackSet.value.clear()

  await useCondition().loadState('temp')

  // 加载存档
  const archiveStore = useArchiveStore()
  const hasArchives = Object.values(archiveStore.archiveSlots).filter(Boolean).length > 0
  if (!hasArchives && archiveStore.currentArchive.slotIndex === undefined) {
    await archiveStore.fetchArchive()
    archiveStore.loadLatestArchive()
  }
}

export const useMap = (canvasRef?: Ref<HTMLCanvasElement | null>) => {
  canvasRef && onMounted(() => canvasRef.value && initMap(canvasRef.value))
  return { map, onMapReady }
}
