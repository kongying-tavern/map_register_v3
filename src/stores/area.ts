import { defineStore } from 'pinia'
import { liveQuery } from 'dexie'
import { useManager } from './hooks'
import { useAccessStore, useUserStore } from '.'
import Api from '@/api/api'
import db from '@/database'
import BulkPutWorker from '@/worker/idb.worker?worker'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import type { Hash } from 'types/database'

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
      hashMap: shallowRef(new Map<string, API.AreaVo[]>()),
    },

    init: async ({ message, hashMap }) => {
      message.value = '初始化上下文'
      const dbList = await db.area.toArray()
      hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
        if (!map.has(hash))
          map.set(hash, [])
        map.get(hash)!.push(info)
        return map
      }, new Map<string, API.AreaVo[]>())
    },

    full: async ({ updateCount, startTime, message, hashMap }) => {
      startTime.value = Date.now()

      // 由于 area 接口暂无档案版，这里直接获取数据本体进行差异判断
      message.value = '获取更新数据'
      const { data = [] } = await Api.area.listArea({ parentId: -1, isTraverse: true })

      message.value = '获取签名'
      const source = new TextEncoder().encode(JSON.stringify(data))
      const hash = await crypto.subtle.digest('SHA-1', source)
      const digest = [...new Uint8Array(hash)].map(num => num.toString(16).padStart(2, '0')).join('')
      const hashList = [digest]

      message.value = '缓存无变动项'
      const needUpdateHashList = hashList.filter(hash => !hashMap.value.has(hash))
      const cachedData = await db.area.where('__hash').anyOf(hashList).toArray()

      const newData = needUpdateHashList.length
        ? data.map((area) => ({ ...area, __hash: digest } as Hash<API.AreaVo>))
        : []

      updateCount.value = newData.length

      return [...cachedData, ...newData]
    },

    commit: async (data, { message, startTime, updateCount }) => {
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '地区数据更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'area', data } as WorkerInput)
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
    context.hashMap.value = dbList.reduce((map, { __hash: hash = '', ...info }) => {
      if (!map.has(hash))
        map.set(hash, [])
      map.get(hash)!.push(info)
      return map
    }, new Map<string, API.AreaVo[]>())
  })

  // ==================== 计算状态 ====================

  const areaList = computed(() => {
    const result: API.AreaVo[] = []
    context.hashMap.value.forEach((areaGroup) => {
      areaGroup.forEach((area) => {
        if (!accessStore.checkHiddenFlag(area.hiddenFlag))
          return
        result.push(area)
      })
    })
    return result.sort(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
  })

  const total = computed(() => areaList.value.length)

  /** @deprecated 使用 `areaIdMap` 代替 */
  const areaMap = computed<Record<string, API.AreaVo>>(() => (Object.fromEntries(areaList.value.map(area => [
    area.id as number,
    area,
  ]))))

  const areaIdMap = computed(() => areaList.value.reduce((seed, area) => {
    seed.set(area.id!, area)
    return seed
  }, new Map<number, API.AreaVo>()))

  const areaCodeMap = computed(() => areaList.value.reduce((seed, area) => {
    seed.set(area.code!, area)
    return seed
  }, new Map<string, API.AreaVo>()))

  const parentAreaList = computed<API.AreaVo[]>(() => areaList.value.filter(area => !area.isFinal))
  const childrenAreaList = computed<API.AreaVo[]>(() => areaList.value.filter(area => area.isFinal))
  const areaTree = computed<AreaWithChildren[]>(() => parentAreaList.value.map(parentArea => ({ ...parentArea, children: childrenAreaList.value.filter(childArea => childArea.parentId === parentArea.id) })))
  const childrenAreaParentMap = computed<Record<number, API.AreaVo[]>>(() => Object.fromEntries(areaTree.value.map(area => [area.id!, area.children ?? []])))

  return {
    // 数据更新
    context,
    nextUpdateTime,
    updateLoading,
    update,

    total,
    areaList,
    areaMap,
    areaIdMap,
    areaCodeMap,
    parentAreaList,
    childrenAreaList,
    childrenAreaParentMap,
    areaTree,
  }
})
