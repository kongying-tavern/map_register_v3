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
import { createHashGroupMap, type HashGroupMeta } from './utils'

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.ItemVo>>>())

  const idHashMap = computed(() => {
    const result = new Map<number, string>()
    hashGroupMap.value.forEach(({ list }) => {
      list.forEach(({ id, __hash = '' }) => {
        result.set(id!, __hash)
      })
    })
    return result
  })

  // ==================== 外部状态 ====================
  const list = computed(() => {
    const res: API.ItemVo[] = []
    hashGroupMap.value.forEach(({ list: scopeList }) => {
      for (let i = 0; i < scopeList.length; i++) {
        const itemInfo = scopeList[i]
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

  const { context, isActive, error: managerError, nextUpdateTime, loading: updateLoading, update } = useManager({
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
      hashGroupMap.value = createHashGroupMap(dbList)
    },

    diff: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.itemDoc.listItemBinaryMD5()

      let oldUpdateTime = 0
      hashGroupMap.value.forEach(({ time }) => {
        if (time > oldUpdateTime)
          oldUpdateTime = time
      })

      let newUpdateTime = 0

      const newHashSet = new Set(hashList)
      const oldHashSet = new Set(hashGroupMap.value.keys())

      const needUpdateHashList = [...newHashSet.difference(oldHashSet)]

      const needDeleteKeys: number[] = []

      message.value = '获取更新数据'
      const newData = (await Promise.all(needUpdateHashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.itemDoc.listPageItemByBinary({ md5: hash }, { responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), { name: `item-${hash}` })
        return data.map((newOne) => (<Hash<API.ItemVo>>{ ...newOne, __hash: hash }))
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

    full: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hashList = [] } = await Api.itemDoc.listItemBinaryMD5()

      message.value = '获取更新数据'
      const newData = (await Promise.all(hashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.itemDoc.listPageItemByBinary({ md5: hash }, { responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<API.ItemVo[]>(new Uint8Array(buffer), { name: `item-${hash}` })
        return data.map((newOne) => (<Hash<API.ItemVo>>{ ...newOne, __hash: hash }))
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
      worker.postMessage(<WorkerInput<number, Hash<API.ItemVo>>>{ tableName: 'item', ...options })
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
    hashGroupMap.value = createHashGroupMap(dbList)
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
    isActive,
    managerError,
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
