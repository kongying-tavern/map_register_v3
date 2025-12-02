import type { Hash } from 'types/database'
import type { HashGroupMeta } from './utils'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useManager } from './hooks'
import { createHashGroupMap } from './utils'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.MarkerVo>>>())

  /**
   * 立即更新存在于 hashGroupMap 内的点位
   * @note 只有在点位即将被 idb 的 liveQuery 更新前才能使用此方法
   */
  const unsafeModify = (markers: Hash<API.MarkerVo>[]) => {
    const updateMarkersMap = markers.reduce((map, marker) => {
      return map.set(marker.id!, marker)
    }, new Map<number, Hash<API.MarkerVo>>())
    hashGroupMap.value.forEach(({ list }) => {
      list.forEach((marker, index) => {
        if (!updateMarkersMap.has(marker.id!))
          return
        list[index] = updateMarkersMap.get(marker.id!)!
        updateMarkersMap.delete(marker.id!)
      })
    })
    updateMarkersMap.forEach((marker) => {
      const hash = marker.__hash ?? ''
      if (!hashGroupMap.value.has(hash)) {
        hashGroupMap.value.set(hash, {
          time: Date.now(),
          list: [marker],
        })
      }
      else {
        const group = hashGroupMap.value.get(hash)
        if (group)
          group.list.push(marker)
      }
    })
    triggerRef(hashGroupMap)
  }

  /**
   * 立即删除存在于 hashGroupMap 内的点位
   * @note 只有在点位即将被 idb 的 liveQuery 删除前才能使用此方法
   */
  const unsafeDelete = (markerIds: number[]) => {
    const deleteIds = new Set(markerIds)
    hashGroupMap.value.forEach(({ list }) => {
      // 从后往前遍历，避免删除时索引错位
      for (let i = list.length - 1; i >= 0; i--) {
        if (deleteIds.has(list[i].id!)) {
          list.splice(i, 1)
        }
      }
    })
    triggerRef(hashGroupMap)
  }

  // ==================== 外部状态 ====================
  const list = computed(() => {
    const res: API.MarkerVo[] = []
    hashGroupMap.value.forEach(({ list: scopeList }) => {
      for (let i = 0; i < scopeList.length; i++) {
        const markerInfo = scopeList[i]
        if (!accessStore.checkHiddenFlag(markerInfo.hiddenFlag))
          continue
        res.push(markerInfo)
      }
    })
    return res
  })

  const total = computed(() => list.value.length)

  const idMap = computed(() => {
    const map = new Map<number, API.MarkerVo>()
    const { length } = list.value
    for (let i = 0; i < length; i++) {
      const marker = list.value[i]
      map.set(marker.id!, marker)
    }
    return map
  })

  // ==================== 数据更新 ====================

  const { context, isActive, error: managerError, nextUpdateTime, loading: updateLoading, update } = useManager({
    timeoutPull: {
      time: 20 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      startTime: ref(Date.now()),
      message: ref(''),
      updateCount: ref(0),
    },

    init: async ({ message }) => {
      message.value = '初始化上下文'
      const dbList = await db.marker.toArray()
      hashGroupMap.value = createHashGroupMap(dbList)
      triggerRef(hashGroupMap)
    },

    diff: async ({ startTime, message, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取 hash 列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      /** oldHashSet 的最晚更新时间 */
      const oldUpdateTime = Array.from(hashGroupMap.value.values()).reduce((max, { time }) => {
        return Math.max(max, time)
      }, 0)

      /** newHashSet 的最晚更新时间 */
      const newUpdateTime = hashList.reduce((max, { time = 0 }) => {
        return Math.max(max, time)
      }, 0)

      // 如果 newHashSet 的最晚更新时间小于 oldHashSet 的最晚更新时间，则表示压缩数据落后于本地，跳过更新
      if (newUpdateTime <= oldUpdateTime) {
        return {
          bulkPutData: [],
          bulkDeleteKeys: [],
          clear: false,
        }
      }

      const newHashSet = new Set(hashList.map(({ md5 = '' }) => md5))
      const oldHashSet = new Set(hashGroupMap.value.keys())

      // 1. 找出所有不存在于旧 hash 里的值，这代表需要进行后续请求以及写入的新数据
      const needUpdateHashList = [...newHashSet.difference(oldHashSet)]

      // 2. 找出需要被删除的点位 id，必须满足以下条件:
      //   a. 点位的 hash 不存在于 newHashSet 里
      //   b. 点位的更新时间小于 newHashSet 的最晚更新时间，这代表在最新的压缩数据里，此点位一定不存在
      //   c. 点位的 __local 字段不为 true，因为 __local === true 表示是本地新增的点位（通过 WebSocket 事件添加），不应该被删除
      // 否则无法区分 "新增" 和 "删除" 点位（假如压缩数据尚未更新，则这两者的 hash 必然不存在于 newHashSet 里）
      const needDeleteKeys: number[] = []

      message.value = '获取更新数据'

      const newData = (await Promise.all(needUpdateHashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerDoc.listPageMarkerByBinary({ md5: hash }, { responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), { name: `marker-${hash}` })
        return data.map(newOne => (<Hash<API.MarkerVo>>{ ...newOne, __hash: hash }))
      }))).flat(1)

      hashGroupMap.value.forEach(({ time, list }, oldHash) => {
        if (newHashSet.has(oldHash) || time >= newUpdateTime)
          return
        for (let i = 0; i < list.length; i++) {
          const item = list[i]
          if (new Date(item.updateTime!).getTime() >= newUpdateTime)
            continue
          // 如果 __local === true，说明是本地新增的点位，不应该被删除
          if (item.__local === true)
            continue
          needDeleteKeys.push(item.id!)
        }
      })

      updateCount.value = newData.length

      return {
        bulkPutData: newData,
        bulkDeleteKeys: needDeleteKeys,
        clear: false,
      }
    },

    full: async ({ startTime, message, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      message.value = '获取更新数据'
      const newData = (await Promise.all(hashList.map(async ({ md5: hash = '' }) => {
        if (!hash)
          return []
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

  liveQuery(() => db.marker.toArray()).subscribe((dbList) => {
    hashGroupMap.value = createHashGroupMap(dbList)
    triggerRef(hashGroupMap)
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
      __hash: 'update',
      __local: true,
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
      __hash: 'add',
      __local: true,
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
      __hash: 'tweak',
      __local: true,
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
    idMap,
  }
})
