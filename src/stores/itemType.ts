import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { Hash } from 'types/database'
import { useManager } from './hooks'
import { useAccessStore, useUserStore } from '.'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'

/** 本地物品类型数据 */
export const useItemTypeStore = defineStore('global-item-type', () => {
  const accessStore = useAccessStore()
  const userStore = useUserStore()

  // ==================== 数据更新 ====================

  const { context, nextUpdateTime, loading: updateLoading, update } = useManager({
    timeoutPull: {
      time: 20 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      updateCount: ref(0),
      startTime: ref(Date.now()),
      message: ref(''),
      hashMap: shallowRef(new Map<string, API.ItemTypeVo[]>()),
    },

    init: async ({ message, hashMap }) => {
      message.value = '初始化上下文'
      const dbList = await db.itemType.toArray()
      hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
        if (!map.has(hash))
          map.set(hash, [])
        map.get(hash)!.push(info)
        return map
      }, new Map<string, API.ItemTypeVo[]>())
    },

    full: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      hashMap.value.clear()
      triggerRef(hashMap)

      // 由于 itemType 接口暂无档案版，这里直接获取数据本体进行差异判断
      message.value = '获取更新数据'
      const { data = [] } = await Api.itemType.listItemType({})

      message.value = '获取签名'
      const source = new TextEncoder().encode(JSON.stringify(data))
      const hash = await crypto.subtle.digest('SHA-1', source)
      const digest = [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
      const hashList = [digest]

      message.value = '缓存无变动项'
      const needUpdateHashList = hashList.filter(hash => !hashMap.value.has(hash))
      const cachedData = await db.itemType.where('__hash').anyOf(hashList).toArray()

      const newData = needUpdateHashList.length
        ? data.map(itemType => ({ ...itemType, __hash: digest } as Hash<API.ItemTypeVo>))
        : []

      updateCount.value = newData.length

      return [...cachedData, ...newData]
    },

    commit: async (data, { message, startTime, updateCount }) => {
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '地区数据更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'itemType', data } as WorkerInput)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  liveQuery(() => db.itemType.toArray()).subscribe((dbList) => {
    context.hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
      if (!map.has(hash))
        map.set(hash, [])
      map.get(hash)!.push(info)
      return map
    }, new Map<string, API.ItemTypeVo[]>())
  })

  // ==================== 计算状态 ====================

  const itemTypeList = computed(() => {
    const result: API.ItemTypeVo[] = []
    context.hashMap.value.forEach((typeGroup) => {
      typeGroup.forEach((itemType) => {
        if (!accessStore.checkHiddenFlag(itemType.hiddenFlag))
          return
        result.push(itemType)
      })
    })
    return result.sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
  })

  const total = computed(() => itemTypeList.value.length)

  /** @deprecated 使用 `itemTypeIdMap` 代替 */
  const itemTypeMap = computed(() => (Object.fromEntries(itemTypeList.value.map(itemType => [
    itemType.id as number,
    itemType,
  ])) as Record<string, API.ItemTypeVo>))

  const itemTypeIdMap = computed(() => itemTypeList.value.reduce((seed, itemType) => {
    seed.set(itemType.id!, itemType)
    return seed
  }, new Map<number, API.ItemTypeVo>()))

  return {
    // 数据更新
    context,
    nextUpdateTime,
    updateLoading,
    update,

    // 计算状态
    total,
    itemTypeList,
    itemTypeMap,
    itemTypeIdMap,
  }
})
