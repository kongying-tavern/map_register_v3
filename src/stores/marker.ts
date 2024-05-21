import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useAccessStore, useSocketStore, useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()

  const _markerList = shallowRef<API.MarkerVo[]>([])

  const markerList = computed(() => _markerList.value.filter(({ hiddenFlag }) => accessStore.checkHiddenFlag(hiddenFlag)))
  const total = computed(() => markerList.value.length)

  const backendUpdater = useBackendUpdate(
    db.marker,
    async () => {
      const { data = [] } = await Api.markerDoc.listMarkerBinaryMD5({})
      return data
    },
    async (md5) => {
      const buffer = await Api.markerDoc.listPageMarkerByBinary({ md5 }, { responseType: 'arraybuffer' }) as unknown as ArrayBuffer
      const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer))
      return data
    },
  )

  liveQuery(() => db.marker.toArray()).subscribe((list) => {
    _markerList.value = list
  })

  const socketStore = useSocketStore()

  // 点位压缩数据更新
  socketStore.event.on('MarkerBinaryPurged', async () => {
    await backendUpdater.refresh()
    ElNotification.info({
      message: `点位数据库更新`,
      position: 'bottom-right',
    })
  })

  // 单个点位更新
  socketStore.event.on('MarkerUpdated', async (id) => {
    const { data: [markerInfo] = [] } = await Api.marker.listMarkerById([id])
    if (!markerInfo)
      return
    await db.marker.put(markerInfo)
    ElNotification.info({
      message: `点位 ${id} 更新`,
      position: 'bottom-right',
    })
  })

  // 单个点位新增
  socketStore.event.on('MarkerAdded', async (id) => {
    const { data: [markerInfo] = [] } = await Api.marker.listMarkerById([id])
    if (!markerInfo)
      return
    await db.marker.put(markerInfo)
    ElNotification.info({
      message: `新增点位 ${id}`,
      position: 'bottom-right',
    })
  })

  // 单个点位删除
  socketStore.event.on('MarkerDeleted', async (id) => {
    await db.marker.delete(id)
    ElNotification.info({
      message: `删除点位 ${id}`,
      position: 'bottom-right',
    })
  })

  // 点位批量更新
  socketStore.event.on('MarkerTweaked', async (ids) => {
    const { data = [] } = await Api.marker.listMarkerById(ids)
    await db.marker.bulkPut(data)
    ElNotification.info({
      title: '点位批量更新',
      message: `点位 ${ids.join(', ')} 更新`,
      position: 'bottom-right',
    })
  })

  return {
    total,
    markerList,
    backendUpdater,
  }
})

userHook.onInfoChange(useMarkerStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
