import type * as API2 from '@/api/alova/globals'
import type { WorkerInput } from '@/worker/idb.worker'
import { Box } from '@element-plus/icons-vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useManager } from './hooks'
import { getCostTime } from './utils'

interface ManagerContext {
  startTime: Ref<number>
  message: Ref<string>
  tag: Ref<string>
}

interface DiffData {
  updateMap: Map<number, API2.ItemVo>
  deleteIds: number[]
  clear?: boolean
}

const getAllItems = async (context: ManagerContext) => {
  context.message.value = '正在获取区域列表'
  const areaIds = await Apis.area.listArea({
    data: { isTraverse: true },
    transform: res => (res.data ?? []).filter(area => area.parentId !== -1).map(({ id }) => id!),
  })
  context.message.value = '正在准备获取物品列表'
  const itemMap = new Map<number, API2.ItemVo>()
  const total = areaIds.length
  let finished = 0
  await Promise.allSettled(areaIds.map(async (areaId) => {
    const { data: { record = [] } = {} } = await Apis.item.listItemIdByType({
      data: {
        areaIdList: [areaId],
        current: 1,
        size: 500,
      },
    })
    const { length } = record
    for (let i = 0; i < length; i++) {
      const item = record[i]
      itemMap.set(item.id!, item)
    }
    finished += 1
    context.message.value = `正在获取物品列表 (${finished}/${total})`
  }))
  return itemMap
}

/** 本地物品数据 */
export const useItemStore = defineStore('global-item', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ============================== 内部状态 ==============================

  /** 物品 id 索引表 */
  const localItemMap = shallowRef(new Map<number, API2.ItemVo>())

  // ============================== 代理方法 ==============================

  /**
   * @local 更新本地物品
   * - 已包含 version 比较逻辑
   */
  const updateLocal = (options: {
    updateList?: Map<number, API2.ItemVo>
    deleteIds?: number[]
  }) => {
    const { updateList = new Map(), deleteIds = [] } = options
    if (!updateList.size && !deleteIds.length)
      return
    const { length: deleteLength } = deleteIds
    for (let i = 0; i < deleteLength; i++) {
      const id = deleteIds[i]
      localItemMap.value.delete(id)
    }
    for (const [_, item] of updateList.entries()) {
      const { id, version = 0 } = item
      if (!id || (version <= (localItemMap.value.get(id)?.version ?? 0)))
        continue
      localItemMap.value.set(id, item)
    }
    triggerRef(localItemMap)
  }

  // ============================== 外部状态 ==============================

  const list = computed(() => {
    const res: API2.ItemVo[] = []
    localItemMap.value.forEach((item) => {
      if (!accessStore.checkHiddenFlag(item.hiddenFlag))
        return
      res.push(item)
    })
    return res.sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
  })

  const total = computed(() => list.value.length)

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

    syncState: async (data, context) => {
      if (!data)
        return
      if (!data.updateMap.size && !data.deleteIds.length) {
        context.message.value = [
          `[${context.tag.value}] `,
          '没有需要更新的数据，',
          `耗时 ${getCostTime(context.startTime.value).toFixed(1)}s`,
        ].join('')
        return
      }
      const { updateMap: updateList, deleteIds } = data
      updateLocal(data)
      context.message.value = [
        `[${context.tag.value}] `,
        `更新(${updateList.size})，`,
        `删除(${deleteIds.length})，`,
        `耗时：${getCostTime(context.startTime.value).toFixed(1)}s`,
      ].join('')
    },

    commit: (data) => {
      if (!data || (!data.updateMap.size && !data.deleteIds.length))
        return
      const worker = new BulkPutWorker({ name: '物品更新线程' })
      worker.addEventListener('message', () => {
        worker.terminate()
      })
      worker.postMessage(<WorkerInput<number, API2.ItemVo>>{
        tableName: 'item',
        clear: data.clear,
        bulkPutData: Array.from(data.updateMap.values()),
        bulkDeleteKeys: data.deleteIds,
      })
    },

    init: async (context) => {
      context.startTime.value = Date.now()
      context.tag.value = '初始化'
      context.message.value = `[${context.tag.value}] 拉取最新数据...`
      const localItems = await getAllItems(context)
      updateLocal({ updateList: localItems })
      context.message.value = `[${context.tag.value}] 完毕: ${getCostTime(context.startTime.value).toFixed(1)}s`
    },

    diff: async () => {
      context.startTime.value = Date.now()
      context.tag.value = '差异'
      context.message.value = '物品数据暂不支持差异更新'
      // no diff for items
    },

    full: async () => {
      context.startTime.value = Date.now()
      context.tag.value = '全量'
      const localItems = await getAllItems(context)
      return { updateMap: localItems, deleteIds: [] }
    },
  })

  // ============================== 外部响应 ==============================
  socketStore.appEvent.on('ItemAdded', async (itemInfo, userInfo) => {
    const { id, name, updaterId } = itemInfo
    if (!id)
      return
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    localItemMap.value.set(id, itemInfo)
    triggerRef(localItemMap)
    socketStore.notice('ItemAdded', {
      message: `${nickname ?? username} 添加了物品 ${name} (id:${id})`,
      icon: Box,
      customClass: 'text-[var(--el-color-success)]',
    })
  })

  socketStore.appEvent.on('ItemUpdated', async (itemInfo, userInfo) => {
    const { id, name, updaterId } = itemInfo
    if (!id)
      return
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    localItemMap.value.set(id, itemInfo)
    triggerRef(localItemMap)
    socketStore.notice('ItemUpdated', {
      message: `${nickname ?? username} 更新了物品 ${name} (id:${id})`,
      icon: Box,
      customClass: 'text-[var(--el-color-primary)]',
    })
  })

  socketStore.appEvent.on('ItemDeleted', async (itemInfo, userInfo) => {
    const { id, name, creatorId } = itemInfo
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    localItemMap.value.delete(id!)
    triggerRef(localItemMap)
    socketStore.notice('ItemDeleted', {
      message: `${nickname ?? username} 删除了物品 ${name} (id:${id})`,
      icon: Box,
      customClass: 'text-[var(--el-color-danger)]',
    })
  })

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,

    // 计算状态
    itemList: list,
    total,
    idMap: localItemMap,
    itemIdMap: localItemMap,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemStore, import.meta.hot))
}
