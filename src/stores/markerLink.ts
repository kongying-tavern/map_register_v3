import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import type { ShallowRef } from 'vue'
import { useSocketStore, useUserStore } from '.'
import { useManager } from '@/stores/hooks'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { Zip } from '@/utils'
import type { Hash } from 'types/database'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
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
      hashMap: shallowRef(new Map<string, API.MarkerLinkageVo[]>()),
    },

    init: async ({ message, hashMap }) => {
      message.value = '初始化上下文'
      const dbList = await db.markerLink.toArray()
      hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
        if (!map.has(hash))
          map.set(hash, [])
        map.get(hash)!.push(info)
        return map
      }, new Map<string, API.MarkerLinkageVo[]>())
    },

    diff: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digest = '' } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()
      const hashList = [digest]

      message.value = '缓存无变动项'
      const needUpdateHashList = hashList.filter(hash => !hashMap.value.has(hash))
      const cachedData = await db.markerLink.where('__hash').anyOf(hashList).toArray()

      message.value = '获取更新数据'
      const newData = (await Promise.all(needUpdateHashList.map(async (md5) => {
        const buffer = await (Api.markerLinkDoc.listAllMarkerLinkageBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
        const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer), {
          name: `markerLink-${md5}`,
        })
        return Object.values(data).reduce((result, linkGroups) => {
          linkGroups.forEach((markerLink) => {
            result.push({ ...markerLink, __hash: md5 } as Hash<API.MarkerLinkageVo>)
          })
          return result
        }, [] as Hash<API.MarkerLinkageVo>[])
      }))).flat(1)

      updateCount.value = newData.length

      return [...cachedData, ...newData]
    },

    full: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      hashMap.value.clear()
      triggerRef(hashMap)

      message.value = '获取签名列表'
      const { data: md5 = '' } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()

      message.value = '获取更新数据'
      const buffer = await (Api.markerLinkDoc.listAllMarkerLinkageBinary({ responseType: 'arraybuffer' }) as unknown as Promise<ArrayBuffer>)
      const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer), {
        name: `markerLink-${md5}`,
      })
      const newData = Object.values(data).reduce((result, linkGroups) => {
        linkGroups.forEach((markerLink) => {
          result.push({ ...markerLink, __hash: md5 } as Hash<API.MarkerLinkageVo>)
        })
        return result
      }, [] as Hash<API.MarkerLinkageVo>[])

      updateCount.value = newData.length

      return newData
    },

    commit: async (data, { message, startTime, updateCount }) => {
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '物品数据更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'markerLink', data } as WorkerInput)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  liveQuery(() => db.markerLink.toArray()).subscribe((dbList) => {
    context.hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
      if (!map.has(hash))
        map.set(hash, [])
      map.get(hash)!.push(info)
      return map
    }, new Map<string, API.MarkerLinkageVo[]>())
  })

  // ==================== 计算状态 ====================

  const markerLinkList = computed(() => {
    const result: API.MarkerLinkageVo[] = []
    context.hashMap.value.forEach((linkGroup) => {
      linkGroup.forEach((markerLink) => {
        result.push(markerLink)
      })
    })
    return result
  })

  const total = computed(() => markerLinkList.value.length)

  const idMap = computed(() => markerLinkList.value.reduce((map, link) => {
    return map.set(link.id!, link)
  }, new Map<number, API.MarkerLinkageVo>()))

  const groupIdMap = computed(() => markerLinkList.value.reduce((map, link) => {
    if (!map.has(link.groupId!))
      map.set(link.groupId!, [])
    map.get(link.groupId!)!.push(link)
    return map
  }, new Map<string, API.MarkerLinkageVo[]>()))

  // ==================== 外部响应 ====================

  socketStore.appEvent.on('MarkerLinkageBinaryPurged', () => update())

  return {
    // 数据更新
    context,
    nextUpdateTime,
    updateLoading,
    update,

    // 计算状态
    total,
    markerLinkList: markerLinkList as Readonly<ShallowRef<API.MarkerLinkageVo[]>>,
    idMap,
    groupIdMap,
  }
})
