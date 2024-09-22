import { defineStore } from 'pinia'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { liveQuery } from 'dexie'
import { useBackendUpdate, userHook } from './hooks'
import { useAccessStore, useSocketStore, useUserAuthStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()

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
      const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), {
        name: `marker-${md5}`,
      })
      return data
    },
  )

  const updateHook = createEventHook<API.MarkerVo>()
  const tweakHook = createEventHook<API.MarkerVo[]>()

  liveQuery(() => db.marker.toArray()).subscribe((list) => {
    _markerList.value = list
  })

  // 点位压缩数据更新
  socketStore.messageEvent.on('MarkerBinaryPurged', () => {
    // 已连接同步服务时不需要全量更新
    if (socketStore.status === WebSocket.OPEN)
      return
    backendUpdater.refresh()
  })

  // 单个点位更新
  socketStore.messageEvent.on('MarkerUpdated', async (markerInfo, userInfo) => {
    await db.marker.put(markerInfo)
    const { id, markerTitle, updaterId } = markerInfo
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerUpdated', {
      message: `${nickname ?? username} 更新了点位 ${markerTitle} (id:${id})`,
      icon: Location,
      customClass: 'text-[var(--el-color-primary)]',
    })
    updateHook.trigger(markerInfo)
  })

  // 单个点位新增
  socketStore.messageEvent.on('MarkerAdded', async (markerInfo, userInfo) => {
    await db.marker.put(markerInfo)
    const { id, markerTitle, creatorId } = markerInfo
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerAdded', {
      message: `${nickname ?? username} 新增了点位 ${markerTitle} (id:${id})`,
      icon: AddLocation,
      customClass: 'text-[var(--el-color-success)]',
    })
  })

  // 单个点位删除
  socketStore.messageEvent.on('MarkerDeleted', async (markerInfo, userInfo) => {
    await db.marker.delete(markerInfo.id!)
    const { id, markerTitle, creatorId } = markerInfo
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerDeleted', {
      message: `${nickname ?? username} 删除了点位 ${markerTitle} (id:${id})`,
      icon: DeleteLocation,
      customClass: 'text-[var(--el-color-danger)]',
    })
  })

  // 点位批量更新
  socketStore.messageEvent.on('MarkerTweaked', async (data, userInfo) => {
    await db.marker.bulkPut(data)
    const [{ updaterId }] = data
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerTweaked', {
      message: `${nickname ?? username} 批量更新了 ${data.length} 个点位`,
      icon: Location,
      customClass: 'text-[var(--el-color-success)]',
    })

    tweakHook.trigger(data)
  })

  return {
    onMarkerUpdate: updateHook.on,
    onMarkerTweake: tweakHook.on,
    total,
    markerList,
    backendUpdater,
  }
})

userHook.onInfoChange(useMarkerStore, async (store) => {
  const { validateToken } = useUserAuthStore()
  validateToken() ? await store.backendUpdater.start() : store.backendUpdater.stop()
})
