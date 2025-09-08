import type { Hash } from 'types/database'
import type { ShallowRef } from 'vue'
import type { HashGroupMeta } from './utils'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useSocketStore, useUserStore } from '.'
import { useIconTextureRender, useManager, useMarkerTextureRender } from './hooks'
import { createHashGroupMap } from './utils'

/** 本地图标数据 */
export const useIconStore = defineStore('global-icon', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.IconVo>>>())

  // ==================== 外部状态 ====================
  const list = computed(() => {
    const result: API.IconVo[] = []
    hashGroupMap.value.forEach(({ list: scopeList }) => {
      scopeList.forEach((icon) => {
        result.push(icon)
      })
    })
    return result
  })

  const total = computed(() => list.value.length)

  /** `icon.id` 到 `icon` 的索引表 */
  const idMap = computed(() => list.value.reduce((seed, icon) => {
    seed.set(icon.id!, icon)
    return seed
  }, new Map<number, API.IconVo>()))

  /** @deprecated 使用 `tagNameMap` 代替 */
  const iconTagMap = computed(() => Object.fromEntries(list.value.map(icon => [
    icon.tag as string,
    icon as API.IconVo,
  ])) as Record<string, API.IconVo>)

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
      const dbList = await db.icon.toArray()
      hashGroupMap.value = createHashGroupMap(dbList)
      triggerRef(hashGroupMap)
    },

    diff: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digestData = {} } = await Api.iconDoc.listAllIconBinaryMd5()
      const { md5: digest = '', time: newUpdateTime = 0 } = digestData
      const hashList = [digest]

      let oldUpdateTime = 0
      hashGroupMap.value.forEach(({ time }) => {
        if (time > oldUpdateTime)
          oldUpdateTime = time
      })

      if (oldUpdateTime >= newUpdateTime) {
        return {
          bulkPutData: [],
          bulkDeleteKeys: [],
          clear: false,
        }
      }

      const newHashSet = new Set(hashList)
      const oldHashSet = new Set(hashGroupMap.value.keys())

      const needUpdateHashList = [...newHashSet.difference(oldHashSet)]
      const needDeleteKeys: number[] = []

      message.value = '获取更新数据'

      const newData = (await Promise.all(needUpdateHashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.iconDoc.listAllIconBinary({ responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<API.IconVo[]>(new Uint8Array(buffer), { name: `icon-${hash}` })
        return data.map(newOne => (<Hash<API.IconVo>>{ ...newOne, __hash: hash }))
      }))).flat(1)

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
      const { data: digestData = {} } = await Api.iconDoc.listAllIconBinaryMd5()
      const { md5: hash = '' } = digestData
      if (hash) {
        return {
          bulkPutData: [],
          bulkDeleteKeys: [],
          clear: false,
        }
      }

      message.value = '获取更新数据'
      const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.iconDoc.listAllIconBinary({ responseType: 'arraybuffer' }))
      const data = await Zip.decompressAs<API.IconVo[]>(new Uint8Array(buffer), { name: `icon-${hash}` })
      const newData = data.map(newOne => (<Hash<API.IconVo>>{ ...newOne, __hash: hash }))

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
      const worker = new BulkPutWorker({ name: '图标更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'icon', ...options } as WorkerInput<number, Hash<API.IconVo>>)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  const {
    texture: iconTexture,
    textureUrl: iconTextureUrl,
    positionList: iconPositionList,
    coordMap: iconCoordMap,
    refresh: refreshIconSprite,
  } = useIconTextureRender()

  const {
    markerSpriteUrl,
    markerSpriteMapping,
  } = useMarkerTextureRender({
    positionList: iconPositionList,
    iconTexture,
  })

  liveQuery(() => db.icon.toArray()).subscribe((dbList) => {
    hashGroupMap.value = createHashGroupMap(dbList)
    triggerRef(hashGroupMap)
    refreshIconSprite(dbList)
  })

  // ==================== 外部响应 ====================

  socketStore.appEvent.on('IconBinaryPurged', () => update())

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,

    /** 图标纹理 */
    iconTexture,
    /** 图标纹理本地地址 */
    iconTextureUrl,
    /** 图标 id 到纹理坐标映射 */
    iconCoordMap,

    // marker resource
    markerSpriteUrl,
    markerSpriteMapping,

    // 计算状态
    iconList: list as Readonly<ShallowRef<API.IconVo[]>>,
    total,
    idMap,
    iconTagMap,
  }
})
