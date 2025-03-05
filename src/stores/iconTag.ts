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

/** 本地图标标签数据 */
export const useIconTagStore = defineStore('global-icon-tag', () => {
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
      hashMap: shallowRef(new Map<string, API.TagVo[]>()),
    },

    init: async ({ message, hashMap }) => {
      message.value = '初始化上下文'
      const dbList = await db.iconTag.toArray()
      hashMap.value = createHashMap(dbList)
    },

    diff: async ({ updateCount, startTime, message, hashMap }) => {
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
      const newData = (await Promise.all(needUpdateHashList.map(async (md5) => {
        const buffer = await (Api.tagDoc.listAllTagBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer), {
          name: `iconTag-${md5}`,
        })
        return data.map(iconTag => ({ ...iconTag, __hash: md5 }))
      }))).flat(1)

      message.value = '清理脏数据'
      await db.iconTag.bulkDelete(needDeleteKeys)

      updateCount.value = newData.length

      return newData
    },

    full: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      hashMap.value.clear()
      triggerRef(hashMap)

      message.value = '获取签名列表'
      const { data: md5 = '' } = await Api.tagDoc.listAllTagBinaryMd5()

      message.value = '获取更新数据'
      const buffer = await (Api.tagDoc.listAllTagBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
      const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer), {
        name: `iconTag-${md5}`,
      })
      const newData = data.map(iconTag => ({ ...iconTag, __hash: md5 }))

      updateCount.value = newData.length

      return newData
    },

    commit: async (data, { message, startTime, updateCount }) => {
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '物品数据更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'iconTag', data } as WorkerInput)
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
    context.hashMap.value = createHashMap(dbList)
    refreshTagSprite(dbList)
  })

  // ==================== 计算状态 ====================

  const tagList = computed(() => {
    const result: API.TagVo[] = []
    context.hashMap.value.forEach((tagGroup) => {
      tagGroup.forEach((tag) => {
        result.push(tag)
      })
    })
    return result
  })

  const total = computed(() => tagList.value.length)

  /** tag 名称到实体的索引表 */
  const tagNameMap = computed(() => tagList.value.reduce((seed, tag) => {
    seed.set(tag.tag!, tag)
    return seed
  }, new Map<string, API.TagVo>()))

  /** @deprecated 使用 `tagNameMap` 代替 */
  const iconTagMap = computed(() => Object.fromEntries(tagList.value.map(iconTag => [
    iconTag.tag as string,
    iconTag as API.TagVo,
  ])) as Record<string, API.TagVo>)

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
    tagNameMap,
    iconTagMap,
  }
})
