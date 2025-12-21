import type { Hash } from 'types/database'
import type { MarkerRenderModelVo } from '@/api/alova/globals'
import { AddLocation, DeleteLocation, Location } from '@element-plus/icons-vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Apis from '@/api/alova'
import Api from '@/api/api'
import { HashFlag } from '@/shared'
import { formatByteSize } from '@/utils'
import { useAccessStore, useSocketStore, useUserStore } from '.'
import { useManager } from './hooks'
import { isAccessible } from './utils'

interface ManagerContext {
  timer: Ref<number>
  startTime: Ref<number>
  message: Ref<string>
}

const getAllMarkers = async (context: ManagerContext) => {
  context.message.value = '正在获取区域列表'
  const { data: areaList = [] } = await Apis.area.listArea({
    data: { isTraverse: true },
  })
  const areaIds = areaList
    .filter(area => area.parentId !== -1)
    .map(({ id }) => id!)
  context.message.value = '正在准备获取点位列表'
  const markerList = await Apis.marker.searchMarker({
    meta: { raw: true },
    data: { areaIdList: areaIds },
    transform: async (res) => {
      const { body } = res as unknown as Response
      if (!body)
        return [] as API.MarkerVo[]
      const decoder = new TextDecoder()
      let text = ''
      let totalBytes = 0
      for await (const chunk of body) {
        totalBytes += chunk.byteLength
        context.message.value = `正在下载点位列表: ${formatByteSize(totalBytes)}`
        text += decoder.decode(chunk, { stream: true })
      }
      const { data: markerList = [] } = JSON.parse(text) as { data: API.MarkerVo[] }
      return markerList as API.MarkerVo[]
    },
  })
  return markerList
}

const getAllRenderMarkers = async (context: ManagerContext) => {
  context.message.value = '正在获取区域列表'
  const { data: areaList = [] } = await Apis.area.listArea({
    data: { isTraverse: true },
  })
  const areaIds = areaList
    .filter(area => area.parentId !== -1)
    .map(area => area.id!)
  context.message.value = '正在准备获取点位列表'
  const { data: markerIdList = [] } = await Apis.marker.searchMarkerId({
    data: { areaIdList: areaIds },
  })
  const markerList = await Apis.marker.listRenderMarkerById({
    meta: { raw: true },
    data: { markerIdList },
    transform: async (res) => {
      const { body } = res as unknown as Response
      if (!body)
        return [] as API.MarkerVo[]
      const decoder = new TextDecoder()
      let text = ''
      let totalBytes = 0
      for await (const chunk of body) {
        totalBytes += chunk.byteLength
        context.message.value = `正在下载点位列表: ${formatByteSize(totalBytes)}`
        text += decoder.decode(chunk, { stream: true })
      }
      const { data: markerList = [] } = JSON.parse(text) as { data: MarkerRenderModelVo[] }
      return markerList as MarkerRenderModelVo[]
    },
  })
  return markerList
}

/** 全量点位的全局数据 */
export const useMarkerStore = defineStore('global-marker', () => {
  const accessStore = useAccessStore()
  const socketStore = useSocketStore()
  const userStore = useUserStore()

  // ==================== 内部状态 ====================

  /** 原始点位 id 到点位对象的映射 */
  const localMarkerMap = shallowRef(new Map<number, API.MarkerVo>())

  /** 点位序列 */
  const markerIdList = computed(() => [...localMarkerMap.value.keys()])

  /**
   * @local 更新本地点位
   * @param markers 点位数据
   */
  const updateLocal = (markers: Hash<API.MarkerVo>[]) => {
    if (!markers.length)
      return
    const ids = new Set(markerIdList.value)
    const markersMap = new Map<number, Hash<API.MarkerVo>>(localMarkerMap.value)
    const { length } = markers
    for (let i = 0; i < length; i++) {
      const marker = markers[i]
      const { id } = marker
      if (!id)
        continue
      ids.add(id)
      markersMap.set(id, marker)
    }
    localMarkerMap.value = markersMap
  }

  /** @local 删除点位 */
  const deleteLocal = (markerIds: number[]) => {
    const deleteIds = new Set(markerIds)
    const markersMap = new Map<number, Hash<API.MarkerVo>>(localMarkerMap.value)
    deleteIds.forEach(id => markersMap.delete(id))
    localMarkerMap.value = markersMap
  }

  /** @server 创建点位 */
  const createMarker = async (markerForm: API.MarkerVo) => {
    const { data: markerId } = await Api.marker.createMarker(markerForm)
    if (!markerId)
      throw new Error('服务器未返回新点位 id')
    const { data: [marker] = [] } = await Apis.marker.listMarkerById({
      data: { markerIdList: [markerId] },
    })
    if (!marker)
      throw new Error('服务器未返回新点位数据')
    const hashMarker: Hash<API.MarkerVo> = { ...marker, __hash: HashFlag.LOCAL }
    updateLocal([hashMarker])
  }

  /** @server 更新点位 */
  const updateMarker = async (markerForm: API.MarkerVo) => {
    if (!markerForm.id)
      throw new Error('点位 id 为空')
    const { data: isSuccess, message } = await Api.marker.updateMarker(markerForm)
    if (!isSuccess)
      throw new Error(message)
    const { data: [marker] = [] } = await Apis.marker.listMarkerById({
      data: { markerIdList: [markerForm.id] },
    })
    if (!marker)
      throw new Error('服务器未返回新点位数据')
    const hashMarker: Hash<API.MarkerVo> = { ...marker, __hash: HashFlag.LOCAL }
    updateLocal([hashMarker])
  }

  /** @server 删除点位 */
  const deleteMarker = async (markerId: number) => {
    const { data: isSuccess, message } = await Api.marker.deleteMarker({ markerId })
    if (!isSuccess)
      throw new Error(message)
    deleteLocal([markerId])
  }

  /** @server 批量操作点位 */
  const tweakMarkers = async (tweaks: API.TweakVo[]) => {
    const { data = [] } = await Api.marker.tweakMarkers(tweaks)
    updateLocal(data.map(marker => ({ ...marker, __hash: HashFlag.LOCAL })))
  }

  // ==================== 外部状态 ====================

  /** 经过 hiddenFlag 过滤后的点位列表 */
  const list = computed(() => {
    const res: API.MarkerVo[] = []
    const { length } = markerIdList.value
    const { userHiddenFlagMask } = accessStore
    for (let i = 0; i < length; i++) {
      const id = markerIdList.value[i]
      if (!id)
        continue
      const marker = localMarkerMap.value.get(id)
      if (!marker)
        continue
      if (!isAccessible(userHiddenFlagMask, marker.hiddenFlag))
        continue
      res.push(marker)
    }
    return res
  })

  const total = computed(() => list.value.length)

  // ==================== 数据更新 ====================

  const {
    context,
    isActive,
    error: managerError,
    nextUpdateTime,
    loading: updateLoading,
    update,
  } = useManager<ManagerContext, void | API.MarkerVo[]>({
    timeoutPull: {
      time: 60 * 60 * 1000,
      condition: () => userStore.info?.roleId !== undefined,
    },

    context: {
      timer: ref(-1),
      startTime: ref(Date.now()),
      message: ref(''),
    },

    init: async (context, full) => {
      window.clearTimeout(context.timer.value)
      context.startTime.value = Date.now()
      context.message.value = '正在初始化点位数据'
      const markerList = await full()
      return markerList
    },

    syncState: async (data) => {
      if (!data)
        return
      const map = new Map<number, API.MarkerVo>(localMarkerMap.value)
      const { length } = data
      for (let i = 0; i < length; i++) {
        const newMarker = data[i]
        const oldMarker = map.get(newMarker.id!)
        if (oldMarker && (oldMarker.version ?? 0) > (newMarker.version ?? 0))
          continue
        map.set(newMarker.id!, newMarker)
      }
      localMarkerMap.value = map
      const costTime = (Date.now() - context.startTime.value) / 1000
      context.message.value += `，耗时：${costTime.toFixed(2)}s`
    },

    diff: async (context) => {
      context.startTime.value = Date.now()
      const renderMarkerList = await getAllRenderMarkers(context)
      context.message.value = `正在对比点位数据`
      const { length } = renderMarkerList
      const newMarkerMap = new Map(localMarkerMap.value)
      const deleteIds = new Set(newMarkerMap.keys())
      const updateIds = new Set<number>()
      for (let i = 0; i < length; i++) {
        const { id, version = 0 } = renderMarkerList[i]
        deleteIds.delete(id!)
        const localMarker = localMarkerMap.value.get(id!)
        if (!localMarker || (localMarker.version ?? 0) < version)
          updateIds.add(id!)
      }
      deleteIds.forEach(id => newMarkerMap.delete(id))
      context.message.value = `更新 ${updateIds.size} 项，删除 ${deleteIds.size} 项`
      const { data: markerList = [] } = await Apis.marker.listMarkerById({
        data: { markerIdList: Array.from(deleteIds) },
      })
      markerList.forEach(marker => newMarkerMap.set(marker.id!, marker))
      return Array.from(newMarkerMap.values())
    },

    full: async (context) => {
      window.clearTimeout(context.timer.value)
      context.startTime.value = Date.now()
      context.message.value = '正在重新获取点位数据'
      const markerList = await getAllMarkers(context)
      context.message.value = `更新 ${markerList.length} 项`
      return markerList
    },

    commit: async () => {
    },
  })

  // ==================== 外部响应 ====================

  // 单个点位更新
  socketStore.appEvent.on('MarkerUpdated', async (markerInfo, userInfo) => {
    const { id, markerTitle, updaterId } = markerInfo
    if (!id)
      return
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerUpdated', {
      message: `${nickname ?? username} 更新了点位 ${markerTitle} (id:${id})`,
      icon: Location,
      customClass: 'text-[var(--el-color-primary)]',
    })
    updateLocal([{ ...markerInfo, __hash: HashFlag.LOCAL }])
  })

  // 单个点位新增
  socketStore.appEvent.on('MarkerAdded', async (markerInfo, userInfo) => {
    const { id, markerTitle, creatorId } = markerInfo
    if (!id)
      return
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerAdded', {
      message: `${nickname ?? username} 新增了点位 ${markerTitle} (id:${id})`,
      icon: AddLocation,
      customClass: 'text-[var(--el-color-success)]',
    })
    updateLocal([{ ...markerInfo, __hash: HashFlag.LOCAL }])
  })

  // 单个点位删除
  socketStore.appEvent.on('MarkerDeleted', async (markerInfo, userInfo) => {
    const { id, markerTitle, creatorId } = markerInfo
    if (!id)
      return
    const { username = `(uid: ${creatorId})`, nickname } = userInfo
    socketStore.notice('MarkerDeleted', {
      message: `${nickname ?? username} 删除了点位 ${markerTitle} (id:${id})`,
      icon: DeleteLocation,
      customClass: 'text-[var(--el-color-danger)]',
    })
    deleteLocal([markerInfo.id!])
  })

  // 点位批量更新
  socketStore.appEvent.on('MarkerTweaked', async (data, userInfo) => {
    if (!data.length)
      return
    const [{ updaterId }] = data
    const { username = `(uid: ${updaterId})`, nickname } = userInfo
    socketStore.notice('MarkerTweaked', {
      message: `${nickname ?? username} 批量更新了 ${data.length} 个点位`,
      icon: Location,
      customClass: 'text-[var(--el-color-success)]',
    })
    updateLocal(data.map(info => ({ ...info, __hash: HashFlag.LOCAL })))
  })

  return {
    // 数据更新
    context,
    isActive,
    managerError,
    nextUpdateTime,
    updateLoading,
    update,
    updateLocal,

    createMarker,
    updateMarker,
    deleteMarker,
    tweakMarkers,

    // 计算状态
    markerList: list,
    total,
    idMap: localMarkerMap,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarkerStore, import.meta.hot))
}
