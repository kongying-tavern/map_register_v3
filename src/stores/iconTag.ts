import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { ShallowRef } from 'vue'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useSocketStore, useUserStore } from '.'
import { useManager, useMarkerSprite, useTagSprite } from './hooks'
import { createHashMap } from './utils'
import type { Hash } from 'types/database'

/** 本地图标标签数据 */
export const useIconTagStore = defineStore('global-icon-tag', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashMap = shallowRef(new Map<string, API.TagVo[]>())

  // ==================== 外部状态 ====================
  const tagList = computed(() => {
    const result: API.TagVo[] = []
    hashMap.value.forEach((tagGroup) => {
      tagGroup.forEach((tag) => {
        result.push(tag)
      })
    })
    return result
  })

  const total = computed(() => tagList.value.length)

  /** tag 名称到实体的索引表 */
  const keyMap = computed(() => tagList.value.reduce((seed, tag) => {
    seed.set(tag.tag!, tag)
    return seed
  }, new Map<string, API.TagVo>()))

  /** @deprecated 使用 `tagNameMap` 代替 */
  const iconTagMap = computed(() => Object.fromEntries(tagList.value.map(iconTag => [
    iconTag.tag as string,
    iconTag as API.TagVo,
  ])) as Record<string, API.TagVo>)

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
      const dbList = await db.iconTag.toArray()
      hashMap.value = createHashMap(dbList)
    },

    diff: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digest = '' } = await Api.tagDoc.listAllTagBinaryMd5()
      const hashList = [digest]

      const newHashSet = new Set(hashList)

      const oldHashSet = new Set(hashMap.value.keys())

      const needUpdateHashList = [...newHashSet.difference(oldHashSet)]

      const needDeleteKeys = [...oldHashSet.difference(newHashSet)].reduce((collect, hash) => {
        hashMap.value.get(hash)?.forEach(({ tag }) => {
          collect.push(tag!)
        })
        return collect
      }, [] as string[])

      message.value = '获取更新数据'
      const newData = (await Promise.all(needUpdateHashList.map(async (hash) => {
        const buffer = await (Api.tagDoc.listAllTagBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer), {
          name: `iconTag-${hash}`,
        })
        return data.map((newOne) => {
          const oldOne = keyMap.value.get(newOne.tag!)
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

    full: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: hash = '' } = await Api.tagDoc.listAllTagBinaryMd5()

      message.value = '获取更新数据'
      const buffer = await (Api.tagDoc.listAllTagBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
      const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer), {
        name: `iconTag-${hash}`,
      })
      const newData = data.map((newOne) => {
        const oldOne = keyMap.value.get(newOne.tag!)
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
      const worker = new BulkPutWorker({ name: '图标标签更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'iconTag', ...options } as WorkerInput<string, Hash<API.TagVo>>)
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
    tagSpriteImage,
    tagSpriteUrl,
    tagPositionMap,
    tagsPositionList,
    tagCoordMap,
    setTagSprite,
    refresh: refreshTagSprite,
  } = useTagSprite()

  const {
    markerSpriteUrl,
    markerSpriteMapping,
  } = useMarkerSprite({
    tagsPositionList,
    tagSprite: tagSpriteImage,
  })

  liveQuery(() => db.iconTag.toArray()).subscribe((dbList) => {
    hashMap.value = createHashMap(dbList)
    refreshTagSprite(dbList)
  })

  // ==================== 外部响应 ====================

  socketStore.appEvent.on('IconTagBinaryPurged', () => update())

  return {
    // 数据更新
    context,
    nextUpdateTime,
    updateLoading,
    update,

    // tag resource
    tagSpriteImage,
    tagSpriteUrl,
    tagPositionMap,
    tagCoordMap,
    setTagSprite,

    // marker resource
    markerSpriteUrl,
    markerSpriteMapping,

    // 计算状态
    tagList: tagList as Readonly<ShallowRef<API.TagVo[]>>,
    total,
    tagNameMap: keyMap,
    iconTagMap,
  }
})
