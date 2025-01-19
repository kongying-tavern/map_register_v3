import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useManager } from './hooks'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', () => {
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
      updateCount: ref(0),
      startTime: ref(Date.now()),
      message: ref(''),
      hashMap: shallowRef(new Map<string, API.ItemVo[]>()),
    },

    init: async ({ message, hashMap }) => {
      message.value = '初始化上下文'
      const dbList = await db.item.toArray()
      hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
        if (!map.has(hash))
          map.set(hash, [])
        map.get(hash)!.push(info)
        return map
      }, new Map<string, API.ItemVo[]>())
    },

    diff: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.itemDoc.listItemBinaryMD5()

      message.value = '缓存无变动项'
      const needUpdateHashList = hashList.filter(hash => !hashMap.value.has(hash))
      const cachedItems = await db.item.where('__hash').anyOf(hashList).toArray()

      message.value = '获取更新数据'
      const newItemData = (await Promise.all(needUpdateHashList.map(async (md5) => {
        const buffer = await (Api.itemDoc.listPageItemByBinary({ md5 }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), {
          name: `item-${md5}`,
        })
        return data.map(item => ({ ...item, __hash: md5 }))
      }))).flat(1)

      updateCount.value = newItemData.length

      return [...cachedItems, ...newItemData]
    },

    full: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      hashMap.value.clear()
      triggerRef(hashMap)

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.itemDoc.listItemBinaryMD5()

      message.value = '获取更新数据'
      const newItemData = (await Promise.all(hashList.map(async (md5) => {
        const buffer = await (Api.itemDoc.listPageItemByBinary({ md5 }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), {
          name: `item-${md5}`,
        })
        return data.map(item => ({ ...item, __hash: md5 }))
      }))).flat(1)

      updateCount.value = newItemData.length

      return newItemData
    },

    commit: async (data, { message, startTime, updateCount }) => {
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '物品数据更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'item', data } as WorkerInput)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  liveQuery(() => db.item.toArray()).subscribe((dbList) => {
    context.hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
      if (!map.has(hash))
        map.set(hash, [])
      map.get(hash)!.push(info)
      return map
    }, new Map<string, API.ItemVo[]>())
  })

  // ==================== 计算状态 ====================

  const list = computed(() => {
    const res: API.ItemVo[] = []
    context.hashMap.value.forEach((hashedItemList) => {
      for (let i = 0; i < hashedItemList.length; i++) {
        const itemInfo = hashedItemList[i]
        if (!accessStore.checkHiddenFlag(itemInfo.hiddenFlag))
          continue
        res.push(itemInfo)
      }
    })
    return res.sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
  })

  const total = computed(() => list.value.length)

  const idMap = computed(() => {
    const map = new Map<number, API.ItemVo>()
    const { length } = list.value
    for (let i = 0; i < length; i++) {
      const item = list.value[i]
      map.set(item.id!, item)
    }
    return map
  })

  const itemIdMap = computed(() => list.value.reduce((seed, item) => {
    seed.set(item.id!, item)
    return seed
  }, new Map<number, API.ItemVo>()))

  // ==================== 外部响应 ====================
  socketStore.event.on('ItemBinaryPurged', () => update())

  return {
    // 数据更新
    context,
    nextUpdateTime,
    updateLoading,
    update,

    // 计算状态
    itemList: list,
    total,
    idMap,
    itemIdMap,
  }
})
