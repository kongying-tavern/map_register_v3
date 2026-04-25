import type { ShallowRef } from 'vue'
import type * as API2 from '@/api/alova/globals'
import type { WorkerInput } from '@/worker/idb.worker'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref, shallowRef, triggerRef } from 'vue'
import Apis from '@/api/alova'
import db from '@/database/db'
import { useManager } from '@/stores/hooks'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useUserStore } from '.'
import { useMarkerStore } from './marker'
import { getCostTime } from './utils'

interface ManagerContext {
  startTime: Ref<number>
  message: Ref<string>
  tag: Ref<string>
}

interface DiffData {
  updateList: API2.MarkerLinkageVo[]
  deleteIds: number[]
  clear?: boolean
}

const getAllMarkerLinks = async (context: ManagerContext) => {
  context.message.value = `[${context.tag.value}] 获取关联数据...`
  const { data: linkGroups = {} } = await Apis.marker_link.getMarkerLinkageList({
    data: {
      isTraverse: true,
    },
  })

  const updateList: API2.MarkerLinkageVo[] = []
  Object.values(linkGroups).forEach((links) => {
    updateList.push(...links)
  })

  return { updateList, deleteIds: [], clear: true }
}

export const useMarkerLinkStore = defineStore('global-marker-link', () => {
  const userStore = useUserStore()
  const markerStore = useMarkerStore()

  // ============================== 内部状态 ==============================

  /** 原始点位关联 id 到点位关联对象的映射 */
  const localLinkMap = shallowRef(new Map<number, API2.MarkerLinkageVo>())

  /**
   * @local 更新本地点位关联
   */
  const updateLocal = (options: {
    updateList?: API2.MarkerLinkageVo[]
    deleteIds?: number[]
    clear?: boolean
  }) => {
    const { updateList = [], deleteIds = [], clear = false } = options
    if (clear)
      localLinkMap.value = new Map<number, API2.MarkerLinkageVo>()
    if (!updateList.length && !deleteIds.length)
      return
    const { length: deleteLength } = deleteIds
    for (let i = 0; i < deleteLength; i++) {
      const id = deleteIds[i]
      localLinkMap.value.delete(id)
    }
    const { length: updateLength } = updateList
    for (let i = 0; i < updateLength; i++) {
      const link = updateList[i]
      const { id, version = 0 } = link
      if (!id || (version <= (localLinkMap.value.get(id)?.version ?? 0)))
        continue
      localLinkMap.value.set(id, link)
    }
    triggerRef(localLinkMap)
  }

  // ============================== 外部状态 ==============================
  const list = computed(() => [...localLinkMap.value.values()])

  const total = computed(() => list.value.length)

  const groupIdMap = computed(() => list.value.reduce((map, link) => {
    if (!map.has(link.groupId!))
      map.set(link.groupId!, [])
    map.get(link.groupId!)!.push(link)
    return map
  }, new Map<string, API2.MarkerLinkageVo[]>()))

  // ============================== 代理方法 ==============================

  /** @server 创建点位关联 */
  const linkMarker = async (
    links: API2.MarkerLinkageVo[],
    deleteLinks: API2.MarkerLinkageVo[] = [],
  ) => {
    if (!links.length)
      throw new Error('提交的关联项为空')

    // 1. 进行关联操作（只取必须的属性）
    const { data: newLinkageId } = await Apis.marker_link.linkMarker({
      data: links.map(link => ({
        fromId: link.fromId,
        toId: link.toId,
        linkAction: link.linkAction,
        path: link.path,
      })),
    })

    if (!newLinkageId)
      throw new Error('服务器未返回新关联组 id')

    // 2. 确认关联更新
    const { data: linkGroups = {} } = await Apis.marker_link.getMarkerLinkageList({
      data: { groupIds: [newLinkageId] },
    })

    const newLinks: API2.MarkerLinkageVo[] = Object.values(linkGroups).flat(1)

    // 3. 收集旧关联影响的全部点位 id
    const oldEffectedMarkerIdSet = links.reduce((result, { fromId = -1, toId = -1 }) => {
      result.add(fromId)
      result.add(toId)
      return result
    }, new Set<number>())
    oldEffectedMarkerIdSet.delete(-1)
    deleteLinks?.forEach(({ fromId = -1, toId = -1 }) => {
      oldEffectedMarkerIdSet.add(fromId)
      oldEffectedMarkerIdSet.add(toId)
    })

    // 4. 收集新关联影响的全部点位 id
    const newEffectedMarkerIdSet = newLinks.reduce((result, { fromId = -1, toId = -1 }) => {
      result.add(fromId)
      result.add(toId)
      return result
    }, new Set<number>())
    newEffectedMarkerIdSet.delete(-1)

    // 5. 合并所有受影响的点位 id
    const allEffectedMarkerIds = Array.from(new Set([...oldEffectedMarkerIdSet, ...newEffectedMarkerIdSet]))

    // 7. 更新本地数据
    // 7.1 更新本地关联表
    updateLocal({ updateList: newLinks })

    Apis.marker.listMarkerById({
      data: { markerIdList: allEffectedMarkerIds },
    }).then(({ data: updatedMarkers = [] }) => {
      markerStore.updateLocal({ updateList: updatedMarkers })
    }).catch(() => false)

    return newLinkageId
  }

  /** @server 删除点位关联 */
  const deleteMarkerLinkage = async (linkIds: number[]) => {
    if (!linkIds.length)
      throw new Error('删除的关联 id 列表为空')

    const { data = {} } = await Apis.marker_link.deleteMarkerLinkage({ data: { ids: linkIds } })
    const { groups: groupIds = [], markers: markerIds = [] } = data

    // 删除本地关联数据
    updateLocal({ deleteIds: linkIds })

    // 异步更新相关关联组和点位数据（非关键路径，失败不影响删除操作）
    Promise.all([
      (async () => {
        if (groupIds.length) {
          const { data = {} } = await Apis.marker_link.getMarkerLinkageList({
            data: { groupIds },
          })
          const links = Object.values(data).flat(1)
          updateLocal({ updateList: links })
        }
      })(),
      (async () => {
        if (markerIds.length) {
          const { data: markers = [] } = await Apis.marker.listMarkerById({
            data: { markerIdList: markerIds },
          })
          const markerStore = useMarkerStore()
          markerStore.updateLocal({ updateList: markers })
        }
      })(),
    ]).catch(() => {
      // 静默处理错误，不影响删除操作
    })

    return data
  }

  // ============================== 数据更新 ==============================

  const {
    context,
    isActive,
    error: managerError,
    nextUpdateTime,
    loading: updateLoading,
    update,
  } = useManager<ManagerContext, DiffData | void>({
    timeoutPull: {
      time: 60 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      startTime: ref(0),
      message: ref(''),
      tag: ref(''),
    },

    syncState: (data) => {
      if (!data)
        return
      if (!data.updateList.length && !data.deleteIds.length) {
        context.message.value = [
          `[${context.tag.value}] `,
          '没有需要更新的数据，',
          `耗时 ${getCostTime(context.startTime.value).toFixed(1)}s`,
        ].join('')
        return
      }
      const { updateList, deleteIds } = data
      updateLocal(data)
      context.message.value = [
        `[${context.tag.value}] `,
        `更新(${updateList.length})，`,
        `删除(${deleteIds.length})，`,
        `耗时：${getCostTime(context.startTime.value).toFixed(1)}s`,
      ].join('')
    },

    commit: async (data) => {
      if (!data || (!data.updateList.length && !data.deleteIds.length))
        return
      const worker = new BulkPutWorker({ name: '点位关联更新线程' })
      worker.addEventListener('message', () => {
        worker.terminate()
      })
      worker.postMessage(<WorkerInput<number, API2.MarkerLinkageVo>>{
        tableName: 'markerLink',
        clear: data.clear,
        bulkPutData: data.updateList,
        bulkDeleteKeys: data.deleteIds,
      })
    },

    init: async (context) => {
      context.startTime.value = Date.now()
      context.tag.value = '初始化'
      context.message.value = `[${context.tag.value}] 拉取冷数据...`
      const localLinks = await db.app.markerLink.toArray()
      updateLocal({ updateList: localLinks })
      context.message.value = `[${context.tag.value}] 完毕: ${getCostTime(context.startTime.value).toFixed(1)}s`
    },

    diff: async (context) => {
      context.startTime.value = Date.now()
      context.tag.value = '差异'
      context.message.value = '关联数据暂不支持差异更新'
    },

    full: async (context) => {
      context.startTime.value = Date.now()
      context.tag.value = '全量'
      const data = await getAllMarkerLinks(context)
      return data
    },
  })

  // ============================== 外部响应 ==============================

  return {
    total,
    markerLinkList: list as Readonly<ShallowRef<API2.MarkerLinkageVo[]>>,
    idMap: localLinkMap,
    groupIdMap,

    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,
    updateLocal,

    // 服务器操作
    linkMarker,
    deleteMarkerLinkage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarkerLinkStore, import.meta.hot))
}
