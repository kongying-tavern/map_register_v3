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
import { useMarkerStore } from './marker'

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()
  const markerStore = useMarkerStore()

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

  // ==================== 服务器操作 ====================

  /** @server 创建点位关联 */
  const linkMarker = async (links: API.MarkerLinkageVo[]) => {
    if (!links.length)
      throw new Error('提交的关联项为空')

    // 1. 进行关联操作（只取必须的属性）
    const { data: newLinkageId } = await Api.markerLink.linkMarker(links.map(link => ({
      fromId: link.fromId,
      toId: link.toId,
      linkAction: link.linkAction,
      path: link.path,
    })))

    if (!newLinkageId)
      throw new Error('服务器未返回新关联组 id')

    // 2. 确认关联更新
    const { data: linkGroups = {} } = await Api.markerLink.getMarkerLinkageList({
      groupIds: [newLinkageId],
    })

    const newLinks: Hash<API.MarkerLinkageVo>[] = Object.values(linkGroups).flat(1).map(link => ({
      ...link,
      __hash: idHashMap.value.get(link.id!) ?? HashFlag.LOCAL,
    }))

    // 3. 收集旧关联影响的全部点位 id
    const oldEffectedMarkerIdSet = links.reduce((result, { fromId = -1, toId = -1 }) => {
      result.add(fromId)
      result.add(toId)
      return result
    }, new Set<number>())
    oldEffectedMarkerIdSet.delete(-1) // 优化: 添加默认值然后删除的操作比起在循环里判断是否为数值再添加更快
    const oldEffectedMarkerIds = Array.from(oldEffectedMarkerIdSet)

    // 4. 收集新关联影响的全部点位 id
    const newEffectedMarkerIdSet = newLinks.reduce((result, { fromId = -1, toId = -1 }) => {
      result.add(fromId)
      result.add(toId)
      return result
    }, new Set<number>())
    newEffectedMarkerIdSet.delete(-1)
    const newEffectedMarkerIds = Array.from(newEffectedMarkerIdSet)

    // 5. 合并所有受影响的点位 id
    const allEffectedMarkerIds = Array.from(new Set([...oldEffectedMarkerIds, ...newEffectedMarkerIds]))

    // 6. 获取所有受影响的点位数据并更新 linkageId
    const updatedMarkers: Hash<API.MarkerVo>[] = []
    const newEffectedMarkerIdSetForUpdate = new Set(newEffectedMarkerIds)
    for (const markerId of allEffectedMarkerIds) {
      const marker = markerStore.idMap.get(markerId)
      if (!marker)
        continue
      const updatedMarker: Hash<API.MarkerVo> = {
        ...marker,
        linkageId: newEffectedMarkerIdSetForUpdate.has(markerId) ? newLinkageId : '',
        __hash: marker.__hash ?? HashFlag.LOCAL,
      }
      updatedMarkers.push(updatedMarker)
    }

    // 7. 更新本地数据
    // 7.1 更新本地关联表
    updateLocal(newLinks)

    // 7.2 更新受影响的点位数据
    if (updatedMarkers.length) {
      markerStore.updateLocal(updatedMarkers)
    }

    return newLinkageId
  }

  /** @server 删除点位关联 */
  const deleteMarkerLinkage = async (linkIds: number[]) => {
    if (!linkIds.length)
      throw new Error('删除的关联 id 列表为空')

    const { data = {} } = await Api.markerLink.deleteMarkerLinkage({ ids: linkIds })
    const { groups: groupIds = [], markers: markerIds = [] } = data

    // 删除本地关联数据
    deleteLocal(linkIds)

    // 异步更新相关关联组和点位数据（非关键路径，失败不影响删除操作）
    Promise.all([
      (async () => {
        if (groupIds.length) {
          const { data = {} } = await Api.markerLink.getMarkerLinkageList({ groupIds })
          const links = Object.values(data).flat(1)
          updateLocal(links.map(link => ({ ...link, __hash: HashFlag.LOCAL })))
        }
      })(),
      (async () => {
        if (markerIds.length) {
          const { data: markers = [] } = await Api.marker.listMarkerById(markerIds)
          const markerStore = useMarkerStore()
          markerStore.updateLocal(markers.map(marker => ({ ...marker, __hash: HashFlag.LOCAL })))
        }
      })(),
    ]).catch(() => {
      // 静默处理错误，不影响删除操作
    })

    return data
  }

  // ==================== 数据更新 ====================

  interface DiffContext {
    controller: ShallowRef<AbortController>
    startTime: Ref<number>
    message: Ref<string>
    updateCount: Ref<number>
  }

  interface DiffData {
    bulkPutData?: Hash<API.MarkerLinkageVo>[]
    bulkDeleteKeys?: number[]
    clear?: boolean
  }

  const {
    context,
    isActive,
    error: managerError,
    nextUpdateTime,
    loading: updateLoading,
    update,
  } = useManager<DiffContext, DiffData | void>({
    timeoutPull: {
      time: 20 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      controller: shallowRef(new AbortController()),
      updateCount: ref(0),
      startTime: ref(Date.now()),
      message: ref(''),
    },

    init: async (context, full) => {
      const dbList = await db.markerLink.toArray()
      if (!dbList.length)
        return full(context)
      return {
        bulkPutData: dbList,
        clear: true,
      } as DiffData
    },

    syncState: (data, _, isInit) => {
      if (data === undefined)
        return
      const { bulkPutData = [], bulkDeleteKeys = [], clear } = data
      const isNew = (isInit || clear)
      const { length: bulkPutDataLength } = bulkPutData
      const deleteIds = new Set(bulkDeleteKeys)
      const newLinkMap = new Map<number, Hash<API.MarkerLinkageVo>>(isNew
        ? []
        : localLinkMap.value,
      )
      const newIdList: number[] = isNew
        ? []
        : linkIdList.value.filter(id => !deleteIds.has(id))
      // 居里化函数，不需要在循环内判断 clear
      const coreProcess = isNew
        ? (link: Hash<API.MarkerLinkageVo>) => {
            if (link.id !== undefined) {
              newLinkMap.set(link.id, link)
              newIdList.push(link.id)
            }
          }
        : (link: Hash<API.MarkerLinkageVo>) => {
            if (link.id !== undefined) {
              newLinkMap.set(link.id, link)
            }
          }
      for (let i = 0; i < bulkPutDataLength; i++) {
        coreProcess(bulkPutData[i])
      }
      localLinkMap.value = newLinkMap
      linkIdList.value = newIdList
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
      if (!options || !updateCount.value) {
        message.value = '没有需要更新的数据'
        return
      }
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

    // 服务器操作
    linkMarker,
    deleteMarkerLinkage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarkerLinkStore, import.meta.hot))
}
