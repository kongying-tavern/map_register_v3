import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useManager, useMarkerSprite, useTagSprite } from './hooks'
import { useSocketStore, useUserStore } from '.'
import { Zip } from '@/utils'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'

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
      hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
        if (!map.has(hash))
          map.set(hash, [])
        map.get(hash)!.push(info)
        return map
      }, new Map<string, API.TagVo[]>())
    },

    diff: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digest = '' } = await Api.tagDoc.listAllTagBinaryMd5()
      const hashList = [digest]

      message.value = '缓存无变动项'
      const needUpdateHashList = hashList.filter(hash => !hashMap.value.has(hash))
      const cachedData = await db.iconTag.where('__hash').anyOf(hashList).toArray()

      message.value = '获取更新数据'
      const newData = (await Promise.all(needUpdateHashList.map(async (md5) => {
        const buffer = await (Api.tagDoc.listAllTagBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<API.TagVo[]>(new Uint8Array(buffer), {
          name: `iconTag-${md5}`,
        })
        return data.map(iconTag => ({ ...iconTag, __hash: md5 }))
      }))).flat(1)

      updateCount.value = newData.length

      return [...cachedData, ...newData]
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
    context.hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
      if (!map.has(hash))
        map.set(hash, [])
      map.get(hash)!.push(info)
      return map
    }, new Map<string, API.TagVo[]>())
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
