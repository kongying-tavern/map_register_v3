import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import Api from '@/api/api'
import db from '@/database'
import { useManager } from '@/stores/hooks'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useAccessStore, useSocketStore, useUserStore } from '.'

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 数据更新 ====================
  const { context, nextUpdateTime, loading: updateLoading, update } = useManager({
    timeoutPull: {
      time: 20 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      startTime: ref(Date.now()),
      message: ref(''),
      hashMap: shallowRef(new Map<string, API.MarkerVo[]>()),
      updateCount: ref(0),
    },

    init: async ({ message, hashMap }) => {
      message.value = '初始化上下文'
      const dbList = await db.marker.toArray()
      hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
        if (!map.has(hash))
          map.set(hash, [])
        map.get(hash)!.push(info)
        return map
      }, new Map<string, API.MarkerVo[]>())
    },

    diff: async ({ startTime, message, hashMap, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      message.value = '缓存无变动项'
      const needUpdateHashList = hashList.filter(hash => !hashMap.value.has(hash))
      const cachedMarker = await db.marker.where('__hash').anyOf(hashList).toArray()

      message.value = '获取更新数据'
      const newMarkerData = (await Promise.all(needUpdateHashList.map(async (md5) => {
        const buffer = await (Api.markerDoc.listPageMarkerByBinary({ md5 }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), {
          name: `marker-${md5}`,
        })
        return data.map(marker => ({ ...marker, __hash: md5 }))
      }))).flat(1)

      updateCount.value = newMarkerData.length

      return [...cachedMarker, ...newMarkerData]
    },

    full: async ({ startTime, message, hashMap, updateCount }) => {
      startTime.value = Date.now()

      hashMap.value.clear()
      triggerRef(hashMap)

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.markerDoc.listMarkerBinaryMD5({})

      message.value = '获取更新数据'
      const newMarkerData = (await Promise.all(hashList.map(async (md5) => {
        const buffer = await (Api.markerDoc.listPageMarkerByBinary({ md5 }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.MarkerVo[]>(new Uint8Array(buffer), {
          name: `marker-${md5}`,
        })
        return data.map(marker => ({ ...marker, __hash: md5 }))
      }))).flat(1)

      updateCount.value = newMarkerData.length

      return newMarkerData
    },

    commit: async (data, { message, startTime, updateCount }) => {
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '点位数据更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'marker', data } as WorkerInput)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  const markerUpdated = createEventHook<number | 'query'>()

  /**
   * 等待指定的 id 都被更新一次。
   * 此逻辑用于确保更新被写入数据库后才执行一些临时任务的状态重置，以避免实际状态和显示状态不一致的问题。
   */
  const afterUpdated = (ids: number[], timeout = 60000) => {
    const { resolve, reject, promise } = Promise.withResolvers<void>()
    const mission = new Set(ids)
    const timerId = setTimeout(() => {
      reject(new Error('任务超时'))
    }, timeout)
    const { off } = markerUpdated.on((arg) => {
      if (arg === 'query') {
        if (mission.size > 0)
          return
        return resolve()
      }
      if (!mission.has(arg))
        return
      mission.delete(arg)
    })
    return promise.finally(() => {
      window.clearTimeout(timerId)
      off()
    })
  }

  db.marker.hook('creating', (id) => {
    markerUpdated.trigger(id)
  })

  db.marker.hook('updating', (_, id) => {
    markerUpdated.trigger(id)
  })

  db.marker.hook('deleting', (id) => {
    markerUpdated.trigger(id)
  })

  liveQuery(() => db.marker.toArray()).subscribe((dbList) => {
    context.hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
      if (!map.has(hash))
        map.set(hash, [])
      map.get(hash)!.push(info)
      return map
    }, new Map<string, API.MarkerVo[]>())
    markerUpdated.trigger('query')
  })

  // ==================== 计算状态 ====================

  const list = computed(() => {
    const res: API.MarkerVo[] = []
    context.hashMap.value.forEach((hashedMarkerList) => {
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

  // ==================== 外部响应 ====================

  // 点位压缩数据更新
  socketStore.appEvent.on('MarkerBinaryPurged', () => {
    update()
  })

  // 单个点位更新
  socketStore.appEvent.on('MarkerUpdated', async (markerInfo, userInfo) => {
    const { id, markerTitle, updaterId } = markerInfo
    if (!id)
      return
    await db.marker.put(markerInfo)
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
    if (!id)
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
    if (!id)
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
    await db.marker.bulkPut(data)
    const [{ updaterId }] = data
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerTweaked', {
      message: `${nickname ?? username} 批量更新了 ${data.length} 个点位`,
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
