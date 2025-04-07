import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'
import type { HashGroupMeta } from './utils'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useAfterUpdated, useManager } from './hooks'
import { createHashGroupMap } from './utils'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.MarkerVo>>>())

  const idHashMap = computed(() => {
    const result = new Map<number, string>()
    hashGroupMap.value.forEach(({ list }) => {
      list.forEach(({ id, __hash: hash = '' }) => {
        result.set(id!, hash)
      })
    })
    return result
  })

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
    },

    diff: async ({ startTime, message, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取 hash 列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      // TODO 等待接口更新
      // const hashList = data.map((md5) => {
      //   return { hash: md5, time: Date.now() }
      // })

      /** oldHashSet 的最晚更新时间 */
      let oldUpdateTime = 0
      hashGroupMap.value.forEach(({ time }) => {
        if (time > oldUpdateTime)
          oldUpdateTime = time
      })

      /** newHashSet 的最晚更新时间 */
      let newUpdateTime = 0
      hashList.forEach(({ time = 0 }) => {
        if (time > newUpdateTime)
          newUpdateTime = time
      })

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

      // 2. 找出需要被删除的点位 id，必须满足以下两个条件:
      //   a. 点位的 hash 不存在于 newHashSet 里
      //   b. 点位的更新时间小于 newHashSet 的最晚更新时间，这代表在最新的压缩数据里，此点位一定不存在
      // 否则无法区分 "新增" 和 "删除" 点位（假如压缩数据尚未更新，则这两者的 hash 必然不存在于 newHashSet 里）
      const needDeleteKeys: number[] = []

      message.value = '获取更新数据'

      const newData = (await Promise.all(needUpdateHashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerDoc.listPageMarkerByBinary({ md5: hash }, { responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), { name: `marker-${hash}` })
        return data.map(newOne => (<Hash<API.MarkerVo>>{ ...newOne, __hash: hash }))
      }))).flat(1)

      const newHashGroup = createHashGroupMap(newData)
      newHashGroup.forEach(({ time }) => {
        if (time > newUpdateTime)
          newUpdateTime = time
      })

      hashGroupMap.value.forEach(({ time, list }, oldHash) => {
        if (newHashSet.has(oldHash) || time >= newUpdateTime)
          return
        for (let i = 0; i < list.length; i++) {
          const item = list[i]
          if (new Date(item.updateTime!).getTime() >= newUpdateTime)
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

  const { waitForUpdate, afterUpdated, triggerUpdated } = useAfterUpdated<number, Hash<API.MarkerVo>>({
    getData: async (ids) => {
      const { data = [] } = await Api.marker.listMarkerById(ids)
      return data.map(newOne => ({ ...newOne, __hash: idHashMap.value.get(newOne.id!) }))
    },
    getKey: marker => marker.id!,
    commit: async (data) => {
      await db.marker.bulkPut(data)
    },
  })

  liveQuery(() => db.marker.toArray()).subscribe((dbList) => {
    if (waitForUpdate.value.size > 0)
      return
    hashGroupMap.value = createHashGroupMap(dbList)
    triggerUpdated()
  })

  // ==================== 外部响应 ====================

  // 点位压缩数据更新
  socketStore.appEvent.on('MarkerBinaryPurged', () => update())

  // 单个点位更新
  socketStore.appEvent.on('MarkerUpdated', async (markerInfo, userInfo) => {
    const { id, markerTitle, updaterId } = markerInfo
    if (!id || waitForUpdate.value.has(id))
      return
    await db.marker.put({
      ...markerInfo,
      __hash: idHashMap.value.get(markerInfo.id!),
    })
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerUpdated', {
      message: `${nickname ?? username} 更新了点位 ${markerTitle} (id:${id})`,
      icon: Location,
      customClass: 'text-[var(--el-color-primary)]',
    })
  })

  // 单个点位新增
  socketStore.appEvent.on('MarkerAdded', async (markerInfo, userInfo) => {
    const { id, markerTitle, creatorId } = markerInfo
    if (!id || waitForUpdate.value.has(id))
      return
    await db.marker.put(markerInfo)
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerAdded', {
      message: `${nickname ?? username} 新增了点位 ${markerTitle} (id:${id})`,
      icon: AddLocation,
      customClass: 'text-[var(--el-color-success)]',
    })
  })

  // 单个点位删除
  socketStore.appEvent.on('MarkerDeleted', async (markerInfo, userInfo) => {
    const { id, markerTitle, creatorId } = markerInfo
    if (!id || waitForUpdate.value.has(id))
      return
    await db.marker.delete(markerInfo.id!)
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerDeleted', {
      message: `${nickname ?? username} 删除了点位 ${markerTitle} (id:${id})`,
      icon: DeleteLocation,
      customClass: 'text-[var(--el-color-danger)]',
    })
  })

  // 点位批量更新
  socketStore.appEvent.on('MarkerTweaked', async (data, userInfo) => {
    const requiredData = data.filter(({ id }) => !waitForUpdate.value.has(id!))
    if (!requiredData.length)
      return
    await db.marker.bulkPut(requiredData.map(info => ({
      ...info,
      __hash: idHashMap.value.get(info.id!),
    })))
    const [{ updaterId }] = requiredData
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerTweaked', {
      message: `${nickname ?? username} 批量更新了 ${requiredData.length} 个点位`,
      icon: Location,
      customClass: 'text-[var(--el-color-success)]',
    })
  })

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,
    afterUpdated,

    // 计算状态
    markerList: list,
    total,
    idMap,
  }
})
