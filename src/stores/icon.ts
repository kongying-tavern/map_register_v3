import type { Hash } from 'types/database'
import type { ShallowRef } from 'vue'
import type { WorkerInput, WorkerOutput } from '@/worker/idb.worker'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Api from '@/api/api'
import db from '@/database'
import { HashFlag } from '@/shared'
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

  /**
   * @local 刷新图标精灵图
   * 与 `iconIdList` / `localIconMap` 当前状态保持一致
   */
  const refreshSpriteByState = () => {
    const allIcons: API.IconVo[] = []
    const { length } = iconIdList.value
    for (let i = 0; i < length; i++) {
      const id = iconIdList.value[i]
      const icon = localIconMap.value.get(id)
      if (icon)
        allIcons.push(icon)
    }
    refreshIconSprite(allIcons)
  }

  /**
   * @local 更新本地图标
   * @param icons 图标数据
   */
  const updateLocal = (icons: Hash<API.IconVo>[]) => {
    if (!icons.length)
      return
    const ids = new Set(iconIdList.value)
    const iconMap = new Map<number, Hash<API.IconVo>>(localIconMap.value)
    const { length } = icons
    for (let i = 0; i < length; i++) {
      const icon = icons[i]
      const { id } = icon
      if (!id)
        continue
      ids.add(id)
      iconMap.set(id, icon)
    }
    iconIdList.value = [...ids]
    localIconMap.value = iconMap
    db.icon.bulkPut(toRaw(icons))
    refreshSpriteByState()
  }

  /** @local 删除本地图标 */
  const deleteLocal = (iconIds: number[]) => {
    const deleteIds = new Set(iconIds)
    const iconMap = new Map<number, Hash<API.IconVo>>(localIconMap.value)
    deleteIds.forEach(id => iconMap.delete(id))
    iconIdList.value = iconIdList.value.filter(id => !deleteIds.has(id))
    localIconMap.value = iconMap
    db.icon.bulkDelete(toRaw(iconIds) as unknown as string[])
    refreshSpriteByState()
  }

  // ==================== 数据更新 ====================

  interface DiffContext {
    controller: ShallowRef<AbortController>
    startTime: Ref<number>
    message: Ref<string>
    updateCount: Ref<number>
  }

  interface DiffData {
    bulkPutData?: Hash<API.IconVo>[]
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
      startTime: ref(Date.now()),
      message: ref(''),
      updateCount: ref(0),
    } as DiffContext,

    init: async (ctx, full) => {
      const dbList = await db.icon.toArray()
      if (!dbList.length)
        return full(ctx)
      return {
        bulkPutData: dbList,
        clear: true,
      } as DiffData
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
      const remoteIconMap = new Map<number, Hash<API.IconVo>>()
      const { length: remoteLength } = data
      for (let i = 0; i < remoteLength; i++) {
        const icon = data[i]
        if (!icon.id)
          continue
        remoteIconMap.set(icon.id, { ...icon, __hash: digest })
      }

      // 计算需要更新与删除的图标
      const needUpdateIcons: Hash<API.IconVo>[] = []
      const needDeleteIconIds: number[] = []
      const localIconMapCopy = new Map(localIconMap.value)

      // 1. 处理新增或版本领先的远程图标
      for (const [id, remoteIcon] of remoteIconMap) {
        const localIcon = localIconMapCopy.get(id)
        // 本地不存在，直接新增
        if (!localIcon) {
          needUpdateIcons.push(remoteIcon)
          continue
        }
        // 版本对比，远程版本领先则更新
        if ((remoteIcon.version ?? 0) > (localIcon.version ?? 0))
          needUpdateIcons.push(remoteIcon)
      }

      // 2. 处理需要删除的本地图标
      for (const [id, localIcon] of localIconMapCopy) {
        // 本地 LOCAL 标记的图标认为是“本地优先”，即使远程没有也不删除
        if (localIcon.__hash === HashFlag.LOCAL)
          continue
        // 远程不存在该 id，认为已被删除
        if (!remoteIconMap.has(id))
          needDeleteIconIds.push(id)
      }

      updateCount.value = needUpdateIcons.length + needDeleteIconIds.length
      if (!updateCount.value)
        return

      return {
        bulkPutData: needUpdateIcons,
        bulkDeleteKeys: needDeleteIconIds,
        clear: false,
      } as DiffData
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
        } as DiffData
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
      } as DiffData
    },

    syncState: (options, _ctx, isInit) => {
      if (!options)
        return
      const {
        bulkPutData = [],
        bulkDeleteKeys = [],
        clear,
      } = options
      const deletedIds = new Set<number>(bulkDeleteKeys as number[])

      // 更新本地状态（与 markerStore 对齐的 Map + idList 结构）
      const isNew = !!(isInit || clear)

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
      refreshSpriteByState()
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

  /** @server 更新图标（封装 Api.icon.updateIcon 与本地更新逻辑） */
  const updateIcon = async (iconForm: API.IconVo) => {
    if (!iconForm.id)
      throw new Error('图标 id 为空')

    const { data: isSuccess, message } = await Api.icon.updateIcon(iconForm)
    if (!isSuccess)
      throw new Error(message)

    // 再次从服务器获取最新数据并写入本地
    try {
      const { data = {}, error, message: getMsg = '' } = await Api.icon.getIcon({ iconId: iconForm.id })
      if (error)
        throw new Error(getMsg)
      const hashIcon: Hash<API.IconVo> = { ...data, __hash: HashFlag.LOCAL }
      updateLocal([hashIcon])
    }
    catch {
      // 同步本地失败不影响整体更新流程，等待后续全量同步修正
    }
  }

  /** @server 删除图标（封装 Api.icon.deleteIcon 与本地更新逻辑） */
  const deleteIcon = async (iconId: number) => {
    const { data: isSuccess, message } = await Api.icon.deleteIcon({ iconId })
    if (!isSuccess)
      throw new Error(message)
    deleteLocal([iconId])
  }

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

    // 本地操作
    updateLocal,
    deleteLocal,

    // 服务器操作
    updateIcon,
    deleteIcon,

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
