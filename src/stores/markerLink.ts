import type { Hash } from 'types/database'
import type { ShallowRef } from 'vue'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref, shallowRef, toRaw, triggerRef } from 'vue'
import Api from '@/api/api'
import db from '@/database'
import { HashFlag } from '@/shared'
import { useManager } from '@/stores/hooks'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useSocketStore, useUserStore } from '.'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================

  /** 原始点位关联 id 到点位关联对象的映射 */
  const localLinkMap = shallowRef(new Map<number, Hash<API.MarkerLinkageVo>>())

  /** 点位关联序列 */
  const linkIdList = ref<number[]>([])

  /**
   * @local 更新本地点位关联
   * @param links 点位关联数据
   */
  const updateLocal = (links: Hash<API.MarkerLinkageVo>[]) => {
    if (!links.length)
      return
    const ids = new Set(linkIdList.value)
    const linksMap = new Map<number, Hash<API.MarkerLinkageVo>>(localLinkMap.value)
    const { length } = links
    for (let i = 0; i < length; i++) {
      const link = links[i]
      const { id } = link
      if (!id)
        continue
      ids.add(id)
      linksMap.set(id, link)
    }
    linkIdList.value = [...ids]
    localLinkMap.value = linksMap
    return db.markerLink.bulkPut(toRaw(links))
  }

  /** @local 删除点位关联 */
  const deleteLocal = (linkIds: number[]) => {
    const deleteIds = new Set(linkIds)
    const linksMap = new Map<number, Hash<API.MarkerLinkageVo>>(localLinkMap.value)
    deleteIds.forEach(id => linksMap.delete(id))
    linkIdList.value = linkIdList.value.filter(id => !deleteIds.has(id))
    localLinkMap.value = linksMap
    return db.markerLink.bulkDelete(toRaw(linkIds))
  }

  // ==================== 外部状态 ====================
  const idHashMap = computed(() => {
    const result = new Map<number, string>()
    const { length } = linkIdList.value
    for (let i = 0; i < length; i++) {
      const id = linkIdList.value[i]
      if (!id)
        continue
      const link = localLinkMap.value.get(id)
      if (!link)
        continue
      result.set(id, link.__hash ?? '')
    }
    return result
  })

  const list = computed(() => {
    const res: Hash<API.MarkerLinkageVo>[] = []
    const { length } = linkIdList.value
    for (let i = 0; i < length; i++) {
      const id = linkIdList.value[i]
      if (!id)
        continue
      const link = localLinkMap.value.get(id)
      if (!link)
        continue
      res.push(link)
    }
    return res
  })

  const total = computed(() => list.value.length)

  const idMap = computed(() => localLinkMap.value)

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
      controller: shallowRef<AbortController | undefined>(undefined),
      updateCount: ref(0),
      startTime: ref(Date.now()),
      message: ref(''),
    },

    init: async () => {
      const dbList = await db.markerLink.toArray()
      const { length } = dbList
      const idList: number[] = []
      for (let i = 0; i < length; i++) {
        const link = dbList[i]
        if (link.id === undefined)
          continue
        localLinkMap.value.set(link.id, link)
        idList.push(link.id)
      }
      linkIdList.value = idList
      triggerRef(localLinkMap)
    },

    diff: async ({ updateCount, startTime, message, controller }) => {
      if (controller.value)
        controller.value.abort()
      const ac = new AbortController()
      controller.value = ac
      startTime.value = Date.now()

      message.value = '获取远程 hash 列表'
      const { data: digestData = {} } = await Api.markerLinkDoc.listAllMarkerLinkageBinaryMD5()
      const { md5: digest = '', time: newUpdateTime = 0 } = digestData
      if (ac.signal.aborted)
        return

      /** 远程 hash 集合 */
      const remoteHashSet = new Set([digest].filter(Boolean))
      /** 远程 hash 的更新时间 */
      const remoteUpdateTime = newUpdateTime
      /** 远程数据集合 */
      const remoteLinksMap = new Map<number, Hash<API.MarkerLinkageVo>>()
      /** 本地 hash 集合 */
      const localHashSet = new Set<string>()
      /** 本地点位关联映射 */
      const localLinksMap = new Map<number, Hash<API.MarkerLinkageVo>>()
      /** 需要确认的点位关联 id 列表 */
      const needConfirmLinkIds: number[] = []
      /** 需要被更新的点位关联数据集合 */
      const needUpdateLinks: Hash<API.MarkerLinkageVo>[] = []
      /** 需要再次确认是否已经被删除的点位关联 id 列表 */
      const needConfirmDeletedLinkIds: number[] = []
      /** 需要被删除的点位关联 id 列表 */
      const needDeleteLinkIds: number[] = []

      // 构建本地点位关联映射
      const { length } = linkIdList.value
      for (let i = 0; i < length; i++) {
        const id = linkIdList.value[i]
        if (!id)
          continue
        const link = localLinkMap.value.get(id)
        if (!link)
          continue
        localLinksMap.set(id, link)
      }

      message.value = '计算需要确认的点位关联 id 列表'
      for (const [id, { __hash: hash, updateTime = 0 }] of localLinksMap) {
        if (!hash)
          continue
        localHashSet.add(hash)
        if (remoteHashSet.has(hash) || (new Date(updateTime).getTime() >= remoteUpdateTime))
          continue
        needConfirmLinkIds.push(id)
      }

      /** 需要用于获取数据的 hash 集合 */
      const needGetHashList = [...remoteHashSet.difference(localHashSet)]

      message.value = '请求差异数据集合'
      await Promise.all(needGetHashList.map(async (hash) => {
        const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.markerLinkDoc.listAllMarkerLinkageBinary({ responseType: 'arraybuffer' }))
        if (ac.signal.aborted)
          return
        const data = await Zip.decompressAs<Record<string, API.MarkerLinkageVo[]>>(new Uint8Array(buffer), { name: `markerLink-${hash}` })
        if (ac.signal.aborted)
          return
        Object.values(data).forEach((linkGroups) => {
          linkGroups.forEach((link) => {
            if (link.id !== undefined)
              remoteLinksMap.set(link.id, { ...link, __hash: hash })
          })
        })
      }))
      if (ac.signal.aborted)
        return

      message.value = '计算差异更新数据'
      const { length: needConfirmLinkIdsLength } = needConfirmLinkIds
      for (let i = 0; i < needConfirmLinkIdsLength; i++) {
        const id = needConfirmLinkIds[i]
        const localLink = localLinksMap.get(id)
        // 1. 本地点位关联不存在（异常情况，忽略）
        if (!localLink)
          continue
        // 2. 如果远程点位关联不存在，表示点位关联可能为新增或删除点位关联，需要二次确认
        const remoteLink = remoteLinksMap.get(id)
        if (!remoteLink) {
          // 如果本地点位关联是本地新增的（通过 WS 事件添加），且远程点位关联不存在，
          // 可能是因为远程压缩数据是过时的，应该保留本地点位关联，而不是尝试删除
          if (localLink.__hash === HashFlag.LOCAL) {
            // 保留本地点位关联，不进行删除确认
            continue
          }
          needConfirmDeletedLinkIds.push(id)
          continue
        }
        // 3. 如果远程点位关联版本落后于本地点位关联，忽略
        // 使用小于是因为在通过接口更新时，会先更新本地点位关联数据，
        // 但不会更新 hash，需要依赖服务端压缩数据的更新来更新本地 hash
        if ((remoteLink.version ?? 0) < (localLink.version ?? 0))
          continue
        // 4. 如果远程点位关联版本领先于本地点位关联，将其加入需要更新的点位关联数据集合
        needUpdateLinks.push(remoteLink)
      }

      updateCount.value = needUpdateLinks.length + needDeleteLinkIds.length

      if (needConfirmDeletedLinkIds.length > 0) {
        message.value = '确认删除数据'
        // 收集需要确认的关联的 groupId
        const needConfirmGroupIds = new Set<string>()
        needConfirmDeletedLinkIds.forEach((id) => {
          const localLink = localLinksMap.get(id)
          if (localLink?.groupId)
            needConfirmGroupIds.add(localLink.groupId)
        })
        const { data: confirmedLinkGroups = {} } = await Api.markerLink.getMarkerLinkageList({ groupIds: [...needConfirmGroupIds] })
        if (ac.signal.aborted)
          return
        // 构建确认的关联映射
        const confirmedLinksMap = new Map<number, API.MarkerLinkageVo>()
        Object.values(confirmedLinkGroups).forEach((linkGroups) => {
          linkGroups.forEach((link) => {
            if (link.id !== undefined)
              confirmedLinksMap.set(link.id, link)
          })
        })
        const { length: needConfirmDeletedLinkIdsLength } = needConfirmDeletedLinkIds
        for (let i = 0; i < needConfirmDeletedLinkIdsLength; i++) {
          const id = needConfirmDeletedLinkIds[i]
          const confirmedLink = confirmedLinksMap.get(id)
          // 如果服务器返回了点位关联，说明点位关联还存在，可能是压缩数据过时了
          // 应该更新点位关联数据，而不是删除
          if (confirmedLink) {
            // 获取本地点位关联用于版本比较
            const localLink = localLinksMap.get(id)
            // 如果服务器点位关联版本领先于本地点位关联，更新本地点位关联
            if (!localLink || (confirmedLink.version ?? 0) > (localLink.version ?? 0)) {
              needUpdateLinks.push({ ...confirmedLink, __hash: HashFlag.LOCAL })
            }
            // 如果服务器点位关联版本落后或等于本地点位关联，保留本地点位关联（不更新也不删除）
            continue
          }
          // 如果服务器没返回点位关联，说明点位关联已删除，应该删除本地点位关联
          needDeleteLinkIds.push(id)
        }
      }

      return {
        bulkPutData: needUpdateLinks,
        bulkDeleteKeys: needDeleteLinkIds,
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
      if (!options) {
        message.value = '没有需要更新的数据'
        return
      }
      const { bulkPutData, bulkDeleteKeys } = options
      const deletedIds = new Set(bulkDeleteKeys)
      for (let i = 0; i < bulkPutData.length; i++) {
        localLinkMap.value.set(bulkPutData[i].id!, bulkPutData[i])
      }
      linkIdList.value = linkIdList.value.filter(id => !deletedIds.has(id))
      triggerRef(localLinkMap)

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
    updateLocal,
    deleteLocal,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarkerLinkStore, import.meta.hot))
}
