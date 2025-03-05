import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { Box } from '@element-plus/icons-vue'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useAfterUpdated, useManager } from './hooks'
import { createHashMap } from './utils'

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashMap = shallowRef(new Map<string, Hash<API.ItemVo>[]>())

  const idHashMap = computed(() => {
    const result = new Map<number, string>()
    hashMap.value.forEach((items) => {
      items.forEach(({ id, __hash = '' }) => {
        result.set(id!, __hash)
      })
    })
    return result
  })

  // ==================== 外部状态 ====================
  const list = computed(() => {
    const res: API.ItemVo[] = []
    hashMap.value.forEach((hashedItemList) => {
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
      const dbList = await db.item.toArray()
      hashMap.value = createHashMap(dbList)
    },

    diff: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.itemDoc.listItemBinaryMD5()

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
        const buffer = await (Api.itemDoc.listPageItemByBinary({ md5: hash }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), {
          name: `item-${hash}`,
        })
        return data.map((newOne) => {
          const oldOne = idMap.value.get(newOne.id!)
          if (!oldOne || ((oldOne.updateTime ?? 0) <= (newOne.updateTime ?? 0)))
            return { ...newOne, __hash: hash }
          return { ...newOne, __hash: hash }
        })
      }))).flat(1)

      message.value = '清理脏数据'
      await db.item.bulkDelete(needDeleteKeys)

      updateCount.value = newData.length

      return {
        bulkPutData: newData,
        bulkDeleteKeys: needDeleteKeys,
        clear: false,
      }
    },

    full: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.itemDoc.listItemBinaryMD5()

      message.value = '获取更新数据'
      const newData = (await Promise.all(hashList.map(async (hash) => {
        const buffer = await (Api.itemDoc.listPageItemByBinary({ md5: hash }, { responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), {
          name: `item-${hash}`,
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
      const worker = new BulkPutWorker({ name: '物品更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'item', ...options } as WorkerInput<number, Hash<API.ItemVo>>)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  const { waitForUpdate, afterUpdated, triggerUpdated } = useAfterUpdated<number, API.ItemVo>({
    getData: async (ids) => {
      const { data = [] } = await Api.item.listItemById(ids)
      return data.map(newOne => ({ ...newOne, __hash: idHashMap.value.get(newOne.id!) }))
    },
    getKey: item => item.id!,
    commit: async (data) => {
      await db.item.bulkPut(data)
    },
  })

  liveQuery(() => db.item.toArray()).subscribe((dbList) => {
    if (waitForUpdate.value.size > 0)
      return
    hashMap.value = createHashMap(dbList)
    triggerUpdated()
  })

  // ==================== 外部响应 ====================
  socketStore.appEvent.on('ItemBinaryPurged', () => update())

  socketStore.appEvent.on('ItemAdded', async (itemInfo, userInfo) => {
    const { id, name, updaterId } = itemInfo
    if (!id || waitForUpdate.value.has(id))
      return
    await db.item.put({
      ...itemInfo,
      __hash: idHashMap.value.get(itemInfo.id!),
    })
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('ItemAdded', {
      message: `${nickname ?? username} 添加了物品 ${name} (id:${id})`,
      icon: Box,
      customClass: 'text-[var(--el-color-success)]',
    })
  })

  socketStore.appEvent.on('ItemUpdated', async (itemInfo, userInfo) => {
    const { id, name, updaterId } = itemInfo
    if (!id || waitForUpdate.value.has(id))
      return
    await db.item.put({
      ...itemInfo,
      __hash: idHashMap.value.get(itemInfo.id!),
    })
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('ItemUpdated', {
      message: `${nickname ?? username} 更新了物品 ${name} (id:${id})`,
      icon: Box,
      customClass: 'text-[var(--el-color-primary)]',
    })
  })

  socketStore.appEvent.on('ItemDeleted', async (itemInfo, userInfo) => {
    await db.item.delete(itemInfo.id!)
    const { id, name, creatorId } = itemInfo
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('ItemDeleted', {
      message: `${nickname ?? username} 删除了物品 ${name} (id:${id})`,
      icon: Box,
      customClass: 'text-[var(--el-color-danger)]',
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
    itemList: list,
    total,
    idMap,
    itemIdMap,
  }
})
