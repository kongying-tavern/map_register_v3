import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useAccessStore, useUserStore } from '.'
import { useManager } from './hooks'
import { createHashMap } from './utils'

/** 本地物品类型数据 */
export const useItemTypeStore = defineStore('global-item-type', () => {
  const accessStore = useAccessStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashMap = shallowRef(new Map<string, Hash<API.ItemTypeVo>[]>())

  // ==================== 外部状态 ====================
  const itemTypeList = computed(() => {
    const result: API.ItemTypeVo[] = []
    hashMap.value.forEach((typeGroup) => {
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

  const idMap = computed(() => itemTypeList.value.reduce((seed, itemType) => {
    seed.set(itemType.id!, itemType)
    return seed
  }, new Map<number, API.ItemTypeVo>()))

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
    },

    init: async ({ message }) => {
      message.value = '初始化上下文'
      const dbList = await db.itemType.toArray()
      hashMap.value = createHashMap(dbList)
    },

    full: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      // 由于 itemType 接口暂无档案版，这里直接获取数据本体进行差异判断
      message.value = '获取更新数据'
      const { data = [] } = await Api.itemType.listItemType({})

      message.value = '获取签名'
      const source = new TextEncoder().encode(JSON.stringify(data))
      const binaryHash = await crypto.subtle.digest('SHA-1', source)
      const hash = [...new Uint8Array(binaryHash)].map(num => num.toString(16).padStart(2, '0')).join('')

      const newData = data.map((newOne) => {
        const oldOne = idMap.value.get(newOne.id!)
        if (!oldOne || ((oldOne.updateTime ?? 0) <= (newOne.updateTime ?? 0)))
          return { ...newOne, __hash: hash }
        return { ...newOne, __hash: hash }
      })

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
      const worker = new BulkPutWorker({ name: '物品类型更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'itemType', ...options } as WorkerInput<number, Hash<API.ItemTypeVo>>)
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
    hashMap.value = createHashMap(dbList)
  })

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
    itemTypeIdMap: idMap,
  }
})
