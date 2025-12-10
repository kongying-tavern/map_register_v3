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
import { isAccessible } from './utils'

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
   * @local 更新本地点位
   * @param markers 点位数据
   * @param isDelete 是否为删除模式 (default: `false`)
   */
  const updateLocal = (markers: Hash<API.MarkerVo>[], isDelete = false) => {
    if (!markers.length)
      return
    const ids = new Set(markerIdList.value)
    const markersMap = new Map<number, Hash<API.MarkerVo>>(localMarkerMap.value)
    const { length } = markers
    if (isDelete) {
      for (let i = 0; i < length; i++) {
        const marker = markers[i]
        const { id } = marker
        if (!id)
          continue
        ids.delete(id)
        markersMap.delete(id)
      }
    }
    else {
      for (let i = 0; i < length; i++) {
        const marker = markers[i]
        const { id } = marker
        if (!id)
          continue
        ids.add(id)
        markersMap.set(id, marker)
      }
    }
    markerIdList.value = [...ids]
    localMarkerMap.value = markersMap
    return db.marker.bulkPut(toRaw(markers))
  }

  /** @local 删除点位 */
  const deleteLocal = (markerIds: number[]) => {
    const deleteIds = new Set(markerIds)
    const markersMap = new Map<number, Hash<API.MarkerVo>>(localMarkerMap.value)
    deleteIds.forEach(id => markersMap.delete(id))
    markerIdList.value = markerIdList.value.filter(id => !deleteIds.has(id))
    localMarkerMap.value = markersMap
    return db.marker.bulkDelete(toRaw(markerIds))
  }

  /** @server 创建点位 */
  const createMarker = async (markerForm: API.MarkerVo) => {
    const { data: markerId } = await Api.marker.createMarker(markerForm)
    if (!markerId)
      throw new Error('服务器未返回新点位 id')
    const { data: [marker] = [] } = await Api.marker.listMarkerById([markerId])
    if (!marker)
      throw new Error('服务器未返回新点位数据')
    const hashMarker: Hash<API.MarkerVo> = { ...marker, __hash: HashFlag.LOCAL }
    updateLocal([hashMarker])
  }

  /** @server 更新点位 */
  const updateMarker = async (markerForm: API.MarkerVo) => {
    if (!markerForm.id)
      throw new Error('点位 id 为空')
    const { data: isSuccess, message } = await Api.marker.updateMarker(markerForm)
    if (!isSuccess)
      throw new Error(message)
    const { data: [marker] = [] } = await Api.marker.listMarkerById([markerForm.id])
    if (!marker)
      throw new Error('服务器未返回新点位数据')
    const hashMarker: Hash<API.MarkerVo> = { ...marker, __hash: HashFlag.LOCAL }
    updateLocal([hashMarker])
  }

  /** @server 删除点位 */
  const deleteMarker = async (markerId: number) => {
    const { data: isSuccess, message } = await Api.marker.deleteMarker({ markerId })
    if (!isSuccess)
      throw new Error(message)
    deleteLocal([markerId])
  }

  /** @server 批量操作点位 */
  const tweakMarkers = async (tweaks: API.TweakVo[]) => {
    const { data = [] } = await Api.marker.tweakMarkers(tweaks)
    updateLocal(data.map(marker => ({ ...marker, __hash: HashFlag.LOCAL })))
  }

  // ==================== 外部状态 ====================

  /** 经过 hiddenFlag 过滤后的点位列表 */
  const list = computed(() => {
    const res: API.MarkerVo[] = []
    const { length } = markerIdList.value
    const { userHiddenFlagMask } = accessStore
    for (let i = 0; i < length; i++) {
      const id = markerIdList.value[i]
      if (!id)
        continue
      const marker = localMarkerMap.value.get(id)
      if (!marker)
        continue
      if (!isAccessible(userHiddenFlagMask, marker.hiddenFlag))
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

    init: async () => {
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
          // 如果本地点位是本地新增的（通过 WS 事件添加），且远程点位不存在，
          // 可能是因为远程压缩数据是过时的，应该保留本地点位，而不是尝试删除
          if (localMarker.__hash === HashFlag.LOCAL) {
            // 保留本地点位，不进行删除确认
            continue
          }
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
          // 如果服务器返回了点位，说明点位还存在，可能是压缩数据过时了
          // 应该更新点位数据，而不是删除
          if (confirmedMarker) {
            // 获取本地点位用于版本比较
            const localMarker = localMarkerMapCopy.get(id)
            // 如果服务器点位版本领先于本地点位，更新本地点位
            if (!localMarker || (confirmedMarker.version ?? 0) > (localMarker.version ?? 0)) {
              needUpdateMarkers.push({ ...confirmedMarker, __hash: HashFlag.LOCAL })
            }
            // 如果服务器点位版本落后或等于本地点位，保留本地点位（不更新也不删除）
            continue
          }
          // 如果服务器没返回点位，说明点位已删除，应该删除本地点位
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
      const { bulkPutData, bulkDeleteKeys } = options
      const deletedIds = new Set(bulkDeleteKeys)
      for (let i = 0; i < bulkPutData.length; i++) {
        localMarkerMap.value.set(bulkPutData[i].id!, bulkPutData[i])
      }
      markerIdList.value = markerIdList.value.filter(id => !deletedIds.has(id))
      triggerRef(localMarkerMap)
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
    updateLocal([{ ...markerInfo, __hash: HashFlag.LOCAL }])
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
    updateLocal([{ ...markerInfo, __hash: HashFlag.LOCAL }])
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
    deleteLocal([markerInfo.id!])
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
    updateLocal(data.map(info => ({ ...info, __hash: HashFlag.LOCAL })), false)
  })

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,
    updateLocal,

    createMarker,
    updateMarker,
    deleteMarker,
    tweakMarkers,

    // 计算状态
    markerList: list,
    total,
    idMap: localMarkerMap,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarkerStore, import.meta.hot))
}
