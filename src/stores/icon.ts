import type { Hash } from 'types/database'
import type { ShallowRef } from 'vue'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Api from '@/api/api'
import db from '@/database'
import { Zip } from '@/utils'
import BulkPutWorker from '@/worker/idb.worker?worker'
import { useSocketStore, useUserStore } from '.'
import { useIconTextureRender, useManager, useMarkerTextureRender } from './hooks'

/** 本地图标数据 */
export const useIconStore = defineStore('global-icon', () => {
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================
  /** 原始图标 id 到图标对象的映射（与 markerStore 对齐） */
  const localIconMap = shallowRef(new Map<number, Hash<API.IconVo>>())

  /** 图标 id 序列（与 markerStore 对齐） */
  const iconIdList = ref<number[]>([])

  // ==================== 外部状态 ====================
  const list = computed(() => {
    const result: API.IconVo[] = []
    const { length } = iconIdList.value
    for (let i = 0; i < length; i++) {
      const id = iconIdList.value[i]
      if (!id)
        continue
      const icon = localIconMap.value.get(id)
      if (!icon)
        continue
      result.push(icon)
    }
    return result
  })

  const total = computed(() => list.value.length)

  const {
    texture: iconTexture,
    textureUrl: iconTextureUrl,
    positionList: iconPositionList,
    coordMap: iconCoordMap,
    refresh: refreshIconSprite,
  } = useIconTextureRender()

  const {
    markerSpriteUrl,
    markerSpriteMapping,
  } = useMarkerTextureRender({
    positionList: iconPositionList,
    iconTexture,
  })

  // ==================== 数据更新 ====================

  const {
    context,
    isActive,
    error: managerError,
    nextUpdateTime,
    loading: updateLoading,
    update,
  } = useManager({
    timeoutPull: {
      time: 20 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      controller: shallowRef(new AbortController()),
      startTime: ref(Date.now()),
      message: ref(''),
      updateCount: ref(0),
    },

    init: async () => {
      const dbList = await db.icon.toArray()
      return {
        bulkPutData: dbList,
        bulkDeleteKeys: [],
        clear: true,
      }
    },

    diff: async ({ startTime, message, updateCount, controller }) => {
      controller.value.abort()
      const ac = new AbortController()
      controller.value = ac
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digestData = {} } = await Api.iconDoc.listAllIconBinaryMd5()
      if (ac.signal.aborted)
        return
      const { md5: digest = '', time: newUpdateTime = 0 } = digestData
      if (!digest)
        return

      // 计算本地数据的最新更新时间
      let oldUpdateTime = 0
      localIconMap.value.forEach((icon) => {
        const time = new Date(icon.updateTime || 0).getTime()
        if (time > oldUpdateTime)
          oldUpdateTime = time
      })

      // 远程数据没有比本地更新，跳过
      if (newUpdateTime <= oldUpdateTime)
        return

      message.value = '获取更新数据'

      const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.iconDoc.listAllIconBinary({ responseType: 'arraybuffer' }))
      if (ac.signal.aborted)
        return
      const data = await Zip.decompressAs<API.IconVo[]>(new Uint8Array(buffer), { name: `icon-${digest}` })
      const newData = data.map(newOne => (<Hash<API.IconVo>>{ ...newOne, __hash: digest }))

      updateCount.value = newData.length

      // 为简化逻辑，图标采用全量覆盖更新（与地区等全量资源一致）
      return {
        bulkPutData: newData,
        bulkDeleteKeys: [],
        clear: true,
      }
    },

    full: async ({ startTime, message, updateCount }) => {
      startTime.value = Date.now()

      message.value = '获取签名列表'
      const { data: digestData = {} } = await Api.iconDoc.listAllIconBinaryMd5()
      const { md5: hash = '' } = digestData
      if (!hash) {
        return {
          bulkPutData: [],
          bulkDeleteKeys: [],
          clear: false,
        }
      }

      message.value = '获取更新数据'
      const buffer = await <Promise<ArrayBuffer>>(<unknown>Api.iconDoc.listAllIconBinary({ responseType: 'arraybuffer' }))
      const data = await Zip.decompressAs<API.IconVo[]>(new Uint8Array(buffer), { name: `icon-${hash}` })
      const newData = data.map(newOne => (<Hash<API.IconVo>>{ ...newOne, __hash: hash }))

      updateCount.value = newData.length

      return {
        bulkPutData: newData,
        bulkDeleteKeys: [],
        clear: true,
      }
    },

    syncState: (options) => {
      if (!options)
        return
      const { bulkPutData, bulkDeleteKeys, clear } = options
      const deletedIds = new Set<number>(bulkDeleteKeys as number[])

      // 更新本地状态（与 markerStore 对齐的 Map + idList 结构）
      const isNew = clear

      const newIconMap = isNew
        ? new Map<number, Hash<API.IconVo>>()
        : new Map<number, Hash<API.IconVo>>(localIconMap.value)

      const newIdList: number[] = []
      if (!isNew) {
        const { length: originLength } = iconIdList.value
        for (let i = 0; i < originLength; i++) {
          const id = iconIdList.value[i]
          if (!deletedIds.has(id)) {
            newIdList.push(id)
          }
        }
      }

      const { length } = bulkPutData
      for (let i = 0; i < length; i++) {
        const icon = bulkPutData[i]
        const id = icon.id
        if (!id)
          continue
        newIconMap.set(id, icon)
        if (isNew) {
          newIdList.push(id)
        }
        else if (!deletedIds.has(id) && !iconIdList.value.includes(id)) {
          newIdList.push(id)
        }
      }

      localIconMap.value = newIconMap
      iconIdList.value = newIdList

      // 刷新图标精灵图，保持与 iconList 顺序一致
      const allIcons: API.IconVo[] = []
      const { length: iconLength } = iconIdList.value
      for (let i = 0; i < iconLength; i++) {
        const id = iconIdList.value[i]
        const icon = localIconMap.value.get(id)
        if (icon)
          allIcons.push(icon)
      }
      refreshIconSprite(allIcons)
    },

    commit: async (options, { message, startTime, updateCount }) => {
      if (!options || !updateCount.value) {
        message.value = '没有需要更新的数据'
        return
      }
      message.value = '写入更新数据'
      const { resolve, promise } = Promise.withResolvers<WorkerOutput>()
      const worker = new BulkPutWorker({ name: '图标更新线程' })
      worker.addEventListener('message', (ev: MessageEvent<WorkerOutput>) => resolve(ev.data))
      worker.postMessage({ tableName: 'icon', ...options } as WorkerInput<number, Hash<API.IconVo>>)
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

  socketStore.appEvent.on('IconBinaryPurged', () => update())

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,

    /** 图标纹理 */
    iconTexture,
    /** 图标纹理本地地址 */
    iconTextureUrl,
    /** 图标 id 到纹理坐标映射 */
    iconCoordMap,

    // marker resource
    markerSpriteUrl,
    markerSpriteMapping,

    // 计算状态
    iconList: list as Readonly<ShallowRef<API.IconVo[]>>,
    total,
    /** 与 markerStore 一致，直接暴露本地 id -> icon 映射表 */
    idMap: localIconMap as unknown as Readonly<ShallowRef<Map<number, API.IconVo>>>,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIconStore, import.meta.hot))
}
