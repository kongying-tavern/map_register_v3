import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useAfterUpdated, useManager } from './hooks'
import { createHashMap } from './utils'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashMap = shallowRef(new Map<string, Hash<API.MarkerVo>[]>())

  const idHashMap = computed(() => {
    const result = new Map<number, string>()
    hashMap.value.forEach((group) => {
      group.forEach(({ id, __hash: hash = '' }) => {
        result.set(id!, hash)
      })
    })
    return result
  })

  // ==================== 外部状态 ====================
  const list = computed(() => {
    const res: API.MarkerVo[] = []
    hashMap.value.forEach((hashedMarkerList) => {
      for (let i = 0; i < hashedMarkerList.length; i++) {
        const markerInfo = hashedMarkerList[i]
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

  const { context, nextUpdateTime, loading: updateLoading, update } = useManager({
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
      hashMap.value = createHashMap(dbList)
    },

    diff: async ({ startTime, message, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      const newHashSet = new Set(hashList)

      const oldHashSet = new Set(hashMap.value.keys())

      const needUpdateHashList = [...newHashSet.difference(oldHashSet)]

      const needDeleteKeys = [...oldHashSet.difference(newHashSet)].reduce((collect, hash) => {
        hashMap.value.get(hash)?.forEach(({ id }) => {
          collect.push(id!)
        })
        return collect
      }, [] as number[])

      message.value = '获取更新数据'
      const newData = (await Promise.all(needUpdateHashList.map(async (hash) => {
        const buffer = await (Api.markerDoc.listPageMarkerByBinary({ md5: hash }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), {
          name: `marker-${hash}`,
        })
        return data.map((newOne) => {
          const oldOne = idMap.value.get(newOne.id!)
          if (!oldOne || ((oldOne.updateTime ?? 0) <= (newOne.updateTime ?? 0)))
            return { ...newOne, __hash: hash }
          return { ...newOne, __hash: hash }
        })
      }))).flat(1)

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
      const newData = (await Promise.all(hashList.map(async (hash) => {
        const buffer = await (Api.markerDoc.listPageMarkerByBinary({ md5: hash }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), {
          name: `marker-${hash}`,
        })
        return data.map((newOne) => {
          const oldOne = idMap.value.get(newOne.id!)
          if (!oldOne || ((oldOne.updateTime ?? 0) <= (newOne.updateTime ?? 0)))
            return { ...newOne, __hash: hash }
          return { ...newOne, __hash: hash }
        })
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
      worker.postMessage({ tableName: 'marker', ...options } as WorkerInput<number, Hash<API.MarkerVo>>)
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
    hashMap.value = createHashMap(dbList)
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
    await db.marker.put({
      ...markerInfo,
      __hash: idHashMap.value.get(markerInfo.id!),
    })
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
