import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'
import type { ShallowRef } from 'vue'
import Api from '@/api/api'
import db from '@/database'
import { useAfterUpdated, useManager } from '@/stores/hooks'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useSocketStore, useUserStore } from '.'
import { createHashGroupMap, type HashGroupMeta } from './utils'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.MarkerLinkageVo>>>())

  // ==================== 外部状态 ====================
  const idHashMap = computed(() => {
    const result = new Map<number, string>()
    hashGroupMap.value.forEach(({ list }) => {
      list.forEach(({ id, __hash: hash = '' }) => {
        result.set(id!, hash)
      })
    })
    return result
  })

  const list = computed(() => {
    const result: Hash<API.MarkerLinkageVo>[] = []
    hashGroupMap.value.forEach(({ list: scopeList }) => {
      scopeList.forEach((markerLink) => {
        result.push(markerLink)
      })
    })
    return result
  })

  const total = computed(() => list.value.length)

  const idMap = computed(() => list.value.reduce((map, link) => {
    return map.set(link.id!, link)
  }, new Map<number, Hash<API.MarkerLinkageVo>>()))

  const groupIdMap = computed(() => list.value.reduce((map, link) => {
    if (!map.has(link.groupId!))
      map.set(link.groupId!, [])
    map.get(link.groupId!)!.push(link)
    return map
  }, new Map<string, Hash<API.MarkerLinkageVo>[]>()))

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
      const dbList = await db.markerLink.toArray()
      hashGroupMap.value = createHashGroupMap(dbList)
    },

    diff: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digest = '' } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()
      const hashList = [digest]

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
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerLinkDoc.listAllMarkerLinkageBinary({ responseType: 'arraybuffer' }))
        const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer), { name: `markerLink-${hash}` })
        return Object.values(data).reduce((result, linkGroups) => {
          linkGroups.forEach((newOne) => {
            result.push(<Hash<API.MarkerLinkageVo>>{ ...newOne, __hash: hash })
          })
          return result
        }, [] as Hash<API.MarkerLinkageVo>[])
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
      const { data: hash = '' } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()

      message.value = '获取更新数据'
      const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerLinkDoc.listAllMarkerLinkageBinary({ responseType: 'arraybuffer' }))
      const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer), { name: `markerLink-${hash}` })
      const newData = Object.values(data).reduce((result, linkGroups) => {
        linkGroups.forEach((newOne) => {
          result.push(<Hash<API.MarkerLinkageVo>>{ ...newOne, __hash: hash })
        })
        return result
      }, [] as Hash<API.MarkerLinkageVo>[])

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
      const worker = new BulkPutWorker({ name: '点位关联更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'markerLink', ...options } as WorkerInput)
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  const { waitForUpdate, afterUpdated, triggerUpdated } = useAfterUpdated<string, Hash<API.MarkerLinkageVo>>({
    getData: async (groupIds) => {
      const { data = {} } = await Api.markerLink.getMarkerLinkageList({ groupIds })
      const groups = groupIds.reduce((result, groupId) => {
        const links = data[groupId]
        if (links) {
          links.forEach((newOne) => {
            const oldLink = idMap.value.get(newOne.id!)
            result.push({ ...newOne, __hash: oldLink?.__hash })
          })
        }
        return result
      }, [] as Hash<API.MarkerLinkageVo>[])
      await db.markerLink.where('groupId').anyOf(groupIds).delete()
      return groups
    },
    getKey: link => link.groupId!,
    commit: async (data) => {
      await db.markerLink.bulkPut(data)
    },
  })

  liveQuery(() => db.markerLink.toArray()).subscribe((dbList) => {
    if (waitForUpdate.value.size > 0)
      return
    hashGroupMap.value = createHashGroupMap(dbList)
    triggerUpdated()
  })

  // ==================== 外部响应 ====================

  socketStore.appEvent.on('MarkerLinkageBinaryPurged', () => update())

  return {
    // 计算状态
    idHashMap,
    total,
    markerLinkList: list as Readonly<ShallowRef<API.MarkerLinkageVo[]>>,
    idMap,
    groupIdMap,

    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,
    afterUpdated,
  }
})
