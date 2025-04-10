import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'
import type { HashGroupMeta } from './utils'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { liveQuery } from 'dexie'
import { defineStore } from 'pinia'
import { useAccessStore, useUserStore } from '.'
import { useManager } from './hooks'
import { createHashGroupMap } from './utils'

export interface AreaWithChildren extends API.AreaVo {
  children?: AreaWithChildren[]
}

export interface AreaWithExtraConfig extends API.AreaVo {
  extraConfig?: API.ExtraConfig
}

/** 本地地区数据 */
export const useAreaStore = defineStore('global-area', () => {
  const accessStore = useAccessStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  const hashGroupMap = shallowRef(new Map<string, HashGroupMeta<Hash<API.AreaVo>>>())

  // ==================== 外部状态 ====================

  const list = computed(() => {
    const result: API.AreaVo[] = []
    hashGroupMap.value.forEach(({ list: scopeList }) => {
      scopeList.forEach((area) => {
        if (!accessStore.checkHiddenFlag(area.hiddenFlag))
          return
        result.push(area)
      })
    })
    return result.sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
  })

  const total = computed(() => list.value.length)

  /** @deprecated 使用 `areaIdMap` 代替 */
  const areaMap = computed<Record<string, API.AreaVo>>(() => (Object.fromEntries(list.value.map(area => [
    area.id as number,
    area,
  ]))))

  const idMap = computed(() => list.value.reduce((seed, area) => {
    seed.set(area.id!, area)
    return seed
  }, new Map<number, API.AreaVo>()))

  const codeMap = computed(() => list.value.reduce((seed, area) => {
    seed.set(area.code!, area)
    return seed
  }, new Map<string, API.AreaVo>()))

  const parentAreaList = computed<API.AreaVo[]>(() => list.value.filter(area => !area.isFinal))
  const childrenAreaList = computed<API.AreaVo[]>(() => list.value.filter(area => area.isFinal))
  const areaTree = computed<AreaWithChildren[]>(() => parentAreaList.value.map(parentArea => ({ ...parentArea, children: childrenAreaList.value.filter(childArea => childArea.parentId === parentArea.id) })))
  const childrenAreaParentMap = computed<Record<number, API.AreaVo[]>>(() => Object.fromEntries(areaTree.value.map(area => [area.id!, area.children ?? []])))

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
      const dbList = await db.area.toArray()
      hashGroupMap.value = createHashGroupMap(dbList)
    },

    full: async ({ updateCount, startTime, message }) => {
      startTime.value = Date.now()

      // 由于 area 接口暂无档案版，直接跳过 diff 进行覆盖更新
      message.value = '获取更新数据'
      const { data = [] } = await Api.area.listArea({ parentId: -1, isTraverse: true })

      message.value = '获取签名'
      const source = new TextEncoder().encode(JSON.stringify(data))
      const binaryHash = await crypto.subtle.digest('SHA-1', source)
      const hash = [...new Uint8Array(binaryHash)].map(num => num.toString(16).padStart(2, '0')).join('')

      const newData = data.map((newOne) => {
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
      const worker = new BulkPutWorker({ name: '地区更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage(<WorkerInput<number, Hash<API.AreaVo>>>{ tableName: 'area', ...options })
      const { error, message: workerMsg } = await promise
      worker.terminate()
      if (error) {
        message.value = workerMsg
        return
      }
      message.value = `更新 ${updateCount.value} 项, 耗时: ${((Date.now() - startTime.value) / 1000).toFixed(1)}s`
    },
  })

  liveQuery(() => db.area.toArray()).subscribe((dbList) => {
    hashGroupMap.value = createHashGroupMap(dbList)
  })

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,

    total,
    areaList: list,
    areaMap,
    areaIdMap: idMap,
    areaCodeMap: codeMap,
    parentAreaList,
    childrenAreaList,
    childrenAreaParentMap,
    areaTree,
  }
})
