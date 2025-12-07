import type { Hash } from 'types/database'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Api from '@/api/api'
import db from '@/database'
import { HashFlag } from '@/shared'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useManager } from './hooks'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================

  /** 原始点位 id 到点位对象的映射 */
  const localMarkerMap = shallowRef(new Map<number, Hash<API.MarkerVo>>())

  /** 点位序列 */
  const markerIdList = ref<number[]>([])

  /**
   * 立即更新存在于 hashGroupMap 内的点位
   * @note 只有在点位即将被 idb 的 liveQuery 更新前才能使用此方法
   */
  const unsafeModify = (markers: Hash<API.MarkerVo>[]) => {
    if (!markers.length)
      return
    const { length } = markers
    for (let i = 0; i < length; i++) {
      const marker = markers[i]
      const { id } = marker
      if (!id)
        continue
      localMarkerMap.value.set(id, marker)
    }
    triggerRef(localMarkerMap)
  }

  /**
   * 立即删除存在于 hashGroupMap 内的点位
   * @note 只有在点位即将被 idb 的 liveQuery 删除前才能使用此方法
   */
  const unsafeDelete = (markerIds: number[]) => {
    const deleteIds = new Set(markerIds)
    markerIdList.value = markerIdList.value.filter(id => !deleteIds.has(id))
  }

  // ==================== 外部状态 ====================

  /** 经过 hiddenFlag 过滤后的点位列表 */
  const list = computed(() => {
    const res: API.MarkerVo[] = []
    const { length } = markerIdList.value
    for (let i = 0; i < length; i++) {
      const id = markerIdList.value[i]
      if (!id)
        continue
      const marker = localMarkerMap.value.get(id)
      if (!marker)
        continue
      if (!accessStore.checkHiddenFlag(marker.hiddenFlag))
        continue
      res.push(marker)
    }
    return res
  })

  const total = computed(() => list.value.length)

  // ==================== 数据更新 ====================

  const { context, isActive, error: managerError, nextUpdateTime, loading: updateLoading, update } = useManager({
    timeoutPull: {
      time: 60 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      controller: shallowRef(new AbortController()),
      startTime: ref(Date.now()),
      message: ref(''),
      updateCount: ref(0),
    },

    init: async ({ message }) => {
      message.value = '初始化上下文'
      const dbList = await db.marker.toArray()
      const { length } = dbList
      const idList: number[] = []
      for (let i = 0; i < length; i++) {
        const marker = dbList[i]
        if (marker.id === undefined)
          continue
        localMarkerMap.value.set(marker.id, marker)
        idList.push(marker.id)
      }
      markerIdList.value = idList
      triggerRef(localMarkerMap)
    },

    diff: async ({ startTime, message, updateCount, controller }) => {
      controller.value.abort()
      const ac = new AbortController()
      controller.value = ac
      startTime.value = Date.now()

      message.value = '获取远程 hash 列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})
      if (ac.signal.aborted)
        return

      /** 远程 hash 集合 */
      const remoteHashSet = new Set(hashList.map(({ md5 = HashFlag.DEFAULT }) => md5))
      /** 远程 hash 的更新时间 */
      const remoteUpdateTime = hashList.reduce((max, { time = 0 }) => Math.max(max, time), 0)
      /** 远程数据集合 */
      const remoteMarkersMap = new Map<number, Hash<API.MarkerVo>>()
      /** 本地 hash 集合 */
      const localHashSet = new Set<string>()
      /** 本地点位映射 */
      const localMarkerMapCopy = new Map(localMarkerMap.value)
      /** 需要确认的点位 id 列表 */
      const needConfirmMarkerIds: number[] = []
      /** 需要被更新的点位数据集合 */
      const needUpdateMarkers: Hash<API.MarkerVo>[] = []
      /** 需要再次确认是否已经被删除的点位 id 列表 */
      const needConfirmDeletedMarkerIds: number[] = []
      /** 需要被删除的点位 id 列表 */
      const needDeleteMarkerIds: number[] = []

      message.value = '计算需要确认的点位 id 列表'
      for (const [id, { __hash: hash, updateTime = 0 }] of localMarkerMapCopy) {
        if (!hash)
          continue
        localHashSet.add(hash)
        if (remoteHashSet.has(hash) || (new Date(updateTime).getTime() >= remoteUpdateTime))
          continue
        needConfirmMarkerIds.push(id!)
      }

      /** 需要用于获取数据的 hash 集合 */
      const needGetHashList = [...remoteHashSet.difference(localHashSet)]

      message.value = '请求差异数据集合'
      await Promise.all(needGetHashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerDoc.listPageMarkerByBinary({ md5: hash }, { responseType: 'arraybuffer' }))
        if (ac.signal.aborted)
          return
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), { name: `marker-${hash}` })
        if (ac.signal.aborted)
          return
        const { length } = data
        for (let i = 0; i < length; i++) {
          const marker = data[i]
          if (!marker.id)
            continue
          remoteMarkersMap.set(marker.id!, { ...marker, __hash: hash })
        }
      }))
      if (ac.signal.aborted)
        return

      message.value = '计算差异更新数据'
      const { length: needConfirmMarkerIdsLength } = needConfirmMarkerIds
      for (let i = 0; i < needConfirmMarkerIdsLength; i++) {
        const id = needConfirmMarkerIds[i]
        const localMarker = localMarkerMapCopy.get(id)
        // 1. 本地点位不存在（异常情况，忽略）
        if (!localMarker)
          continue
        // 2. 如果远程点位不存在，表示点位可能为新增或删除点位，需要二次确认
        const remoteMarker = remoteMarkersMap.get(id)
        if (!remoteMarker) {
          needConfirmDeletedMarkerIds.push(id)
          continue
        }
        // 3. 如果远程点位版本落后于本地点位，忽略
        // 使用小于是因为在通过接口更新时，会先更新本地点位数据，
        // 但不会更新 hash，需要依赖服务端压缩数据的更新来更新本地 hash
        if ((remoteMarker.version ?? 0) < (localMarker.version ?? 0))
          continue
        // 4. 如果远程点位版本领先于本地点位，将其加入需要更新的点位数据集合
        needUpdateMarkers.push(remoteMarker)
      }

      updateCount.value = needUpdateMarkers.length + needDeleteMarkerIds.length

      if (needConfirmDeletedMarkerIds.length > 0) {
        message.value = '确认删除数据'
        const { data: confirmedMarkers = [] } = await Api.marker.listMarkerById(needConfirmDeletedMarkerIds)
        if (ac.signal.aborted)
          return
        const confirmedMarkersMap = new Map(confirmedMarkers.map(marker => [marker.id, marker]))
        const { length: needConfirmDeletedMarkerIdsLength } = needConfirmDeletedMarkerIds
        for (let i = 0; i < needConfirmDeletedMarkerIdsLength; i++) {
          const id = needConfirmDeletedMarkerIds[i]
          const confirmedMarker = confirmedMarkersMap.get(id)
          if (!confirmedMarker)
            continue
          needDeleteMarkerIds.push(id)
        }
      }

      return {
        bulkPutData: needUpdateMarkers,
        bulkDeleteKeys: needDeleteMarkerIds,
        clear: false,
      }
    },

    full: async ({ startTime, message, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      message.value = '获取更新数据'
      const newData = (await Promise.all(hashList.map(async ({ md5: hash = HashFlag.DEFAULT }) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerDoc.listPageMarkerByBinary({ md5: hash }, { responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), { name: `marker-${hash}` })
        return data.map(newOne => (<Hash<API.MarkerVo>>{ ...newOne, __hash: hash }))
      }))).flat(1)

      updateCount.value = newData.length

      return {
        bulkPutData: newData,
        bulkDeleteKeys: [],
        clear: true,
      }
    },

    commit: async (options, { message, startTime, updateCount }) => {
      if (!options) {
        message.value = '没有需要更新的数据'
        return
      }
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '点位更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage(<WorkerInput<number, Hash<API.MarkerVo>>>{ tableName: 'marker', ...options })
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  // ==================== 外部响应 ====================

  // 点位压缩数据更新
  socketStore.appEvent.on('MarkerBinaryPurged', () => update())

  // 单个点位更新
  socketStore.appEvent.on('MarkerUpdated', async (markerInfo, userInfo) => {
    const { id, markerTitle, updaterId } = markerInfo
    if (!id)
      return
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerUpdated', {
      message: `${nickname ?? username} 更新了点位 ${markerTitle} (id:${id})`,
      icon: Location,
      customClass: 'text-[var(--el-color-primary)]',
    })
    if (markerInfo.updaterId === userStore.info?.id)
      return
    await db.marker.put({
      ...markerInfo,
      __hash: HashFlag.LOCAL,
    })
  })

  // 单个点位新增
  socketStore.appEvent.on('MarkerAdded', async (markerInfo, userInfo) => {
    const { id, markerTitle, creatorId } = markerInfo
    if (!id)
      return
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerAdded', {
      message: `${nickname ?? username} 新增了点位 ${markerTitle} (id:${id})`,
      icon: AddLocation,
      customClass: 'text-[var(--el-color-success)]',
    })
    if (markerInfo.updaterId === userStore.info?.id)
      return
    await db.marker.put({
      ...markerInfo,
      __hash: HashFlag.LOCAL,
    })
  })

  // 单个点位删除
  socketStore.appEvent.on('MarkerDeleted', async (markerInfo, userInfo) => {
    const { id, markerTitle, creatorId } = markerInfo
    if (!id)
      return
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerDeleted', {
      message: `${nickname ?? username} 删除了点位 ${markerTitle} (id:${id})`,
      icon: DeleteLocation,
      customClass: 'text-[var(--el-color-danger)]',
    })
    if (markerInfo.updaterId === userStore.info?.id)
      return
    await db.marker.delete(markerInfo.id!)
  })

  // 点位批量更新
  socketStore.appEvent.on('MarkerTweaked', async (data, userInfo) => {
    if (!data.length)
      return
    const [{ updaterId }] = data
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerTweaked', {
      message: `${nickname ?? username} 批量更新了 ${data.length} 个点位`,
      icon: Location,
      customClass: 'text-[var(--el-color-success)]',
    })
    if (updaterId === userStore.info?.id)
      return
    await db.marker.bulkPut(data.map(info => ({
      ...info,
      __hash: HashFlag.LOCAL,
    })))
  })

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,
    unsafeModify,
    unsafeDelete,

    // 计算状态
    markerList: list,
    total,
    idMap: localMarkerMap,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarkerStore, import.meta.hot))
}
