import type { Hash } from 'types/database'
import type { ShallowRef } from 'vue'
import type { HashGroupMeta } from './utils'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import Api from '@/api/api'
import db from '@/database'
import { useAfterUpdated, useManager } from '@/stores/hooks'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useSocketStore, useUserStore } from '.'
import { createHashGroupMap } from './utils'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.MarkerLinkageVo>>>())

  /**
   * 立即更新存在于 hashGroupMap 内的点位关联
   * @note 只有在点位关联即将被 idb 的 liveQuery 更新前才能使用此方法
   */
  const unsafeModify = (links: Hash<API.MarkerLinkageVo>[]) => {
    const updateLinksMap = links.reduce((map, link) => {
      return map.set(link.id!, link)
    }, new Map<number, Hash<API.MarkerLinkageVo>>())
    hashGroupMap.value.forEach(({ list }) => {
      list.forEach((link, index) => {
        if (!updateLinksMap.has(link.id!))
          return
        list[index] = updateLinksMap.get(link.id!)!
        updateLinksMap.delete(link.id!)
      })
    })
    updateLinksMap.forEach((link) => {
      const hash = link.__hash ?? ''
      if (!hashGroupMap.value.has(hash)) {
        hashGroupMap.value.set(hash, {
          time: Date.now(),
          list: [link],
        })
      }
      else {
        const group = hashGroupMap.value.get(hash)
        if (group)
          group.list.push(link)
      }
    })
    triggerRef(hashGroupMap)
  }

  /**
   * 立即删除存在于 hashGroupMap 内的点位关联
   * @note 只有在点位关联即将被 idb 的 liveQuery 删除前才能使用此方法
   */
  const unsafeDelete = (linkIds: number[]) => {
    const deleteIds = new Set(linkIds)
    hashGroupMap.value.forEach(({ list }) => {
      list.forEach((link, index) => {
        if (deleteIds.has(link.id!)) {
          list.splice(index, 1)
        }
      })
    })
    triggerRef(hashGroupMap)
  }

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
      triggerRef(hashGroupMap)
    },

    diff: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digestData = {} } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()
      const { md5: digest = '', time: newUpdateTime = 0 } = digestData
      const hashList = [digest]

      let oldUpdateTime = 0
      hashGroupMap.value.forEach(({ time }) => {
        if (time > oldUpdateTime)
          oldUpdateTime = time
      })

      if (oldUpdateTime >= newUpdateTime)
        return

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
      const { data: digestData = {} } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()
      const { md5: hash = '' } = digestData
      if (!hash) {
        return {
          bulkPutData: [],
          bulkDeleteKeys: [],
          clear: false,
        }
      }

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
    triggerRef(hashGroupMap)
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
    unsafeModify,
    unsafeDelete,
    afterUpdated,
  }
})
