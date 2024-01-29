import type { PickingInfo } from '@deck.gl/core/typed'
import { useMapStateStore } from '@/stores'
import { mapWindowContext as windowCtx } from '@/pages/pageMapV2/components'
import { GSMarkerLayer } from '@/pages/pageMapV2/core/layer'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import db from '@/database'
import { LinkActionEnum } from '@/shared'

interface MarkerLinkProps {
  fromId: number
  toId: number
  linkAction: LinkActionEnum
}

export class MLContext {
  /** 上下文 id */
  readonly id = crypto.randomUUID()

  /** 源点位 */
  sourceMarker = ref<GSMapState.MarkerWithRenderConfig>()

  /** 目标点位 */
  targetMarker = ref<GSMapState.MarkerWithRenderConfig>()

  /** 关联行为 */
  linkAction = ref(LinkActionEnum.TRIGGER)
  setLinkAction = (newLinkAction: LinkActionEnum) => {
    this.linkAction.value = newLinkAction
  }

  /** 新增关联列表 */
  missionLinkList = shallowRef<API.MarkerLinkageVo[]>([])

  /** 源点关联列表 */
  sourceLinkList = shallowRef<API.MarkerLinkageVo[]>([])

  /** 目标点关联列表 */
  targetLinkList = shallowRef<API.MarkerLinkageVo[]>([])

  /** 关联任务是否可用 */
  isMissionEnable: Ref<boolean>

  /** 是否正在进行关联任务 */
  isMissionProcessing: Ref<boolean>

  updateMission: (value: API.MarkerLinkageVo[] | null) => void

  /** 已添加的关联 */
  linkList = shallowRef<API.MarkerLinkageVo[]>([])
  setMarkerLinkList = (value: API.MarkerLinkageVo[]) => {
    this.linkList.value = value
  }

  /** 获取关联条目的唯一标识 */
  getLinkKey = ({ fromId, toId, linkAction }: MarkerLinkProps) => {
    return `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}-${linkAction}`
  }

  /** 切换任务开关 */
  toggleMarkerLink = async () => {
    if (this.isMissionProcessing.value) {
      windowCtx.closeWindow(this.id)
      return
    }
    // 清理 focus 及其副作用
    this.setMarkerFocus(null)
    // 暂停 focus 交互，点击事件交由该上下文处理
    this.pauseFocus()
    // 注册点击事件处理器
    this.mapStateStore.event.on('click', this.handleMapClick)
    // 开启关联数据变化到地图渲染的映射
    this.resumeUpdateMLRenderList()
    // 切换 focus 与 hover 导致的点位弹窗行为
    this.mapStateStore.setIsPopoverOnHover(true)
    // 初始化关联任务
    this.updateMission([])
    // 打开点位关联弹窗
    windowCtx.openWindow({ id: this.id, name: '点位关联' })
  }

  putLink = (markerLink: MarkerLinkProps) => {
    const key = this.getLinkKey(markerLink)

    const list = [...this.linkList.value]

    const tripleTupleIndex = list.findIndex(({ fromId = 0, toId = 0 }) => this.getLinkKey({
      fromId,
      toId,
      linkAction: this.linkAction.value,
    }) === key)

    if (tripleTupleIndex > -1)
      list.splice(tripleTupleIndex, 1, markerLink)
    else
      list.push(markerLink)

    this.linkList.value = list
    this.updateMission(this.mergeMarkerLinkList(this.sourceLinkList.value, this.targetLinkList.value))
    this.resetSelectedState()
  }

  deleteLink = (key: string) => {
    const list = [...this.linkList.value]

    const tripleTupleIndex = list.findIndex(({ fromId = 0, toId = 0 }) => this.getLinkKey({
      fromId,
      toId,
      linkAction: this.linkAction.value,
    }) === key)
    if (tripleTupleIndex > -1)
      return false

    list.splice(tripleTupleIndex, 1)

    this.linkList.value = list

    this.updateMission(this.mergeMarkerLinkList(this.sourceLinkList.value, this.targetLinkList.value))
    this.resetSelectedState()

    return true
  }

  /** 清除任务 */
  finalize = () => {
    this.clearMission()
  }

  /** 取消对话 */
  cancel = () => {
    windowCtx.closeWindow(this.id)
  }

  constructor() {
    // 订阅点位关联任务并控制器
    const {
      isEnable,
      isProcessing,
      data: linkList,
      update,
      clear,
      onClear,
    } = this.mapStateStore.subscribeMission('markerLink', () => [])

    this.isMissionEnable = isEnable
    this.isMissionProcessing = isProcessing
    this.clearMission = clear
    this.updateMission = update

    // 订阅 focus 交互
    const {
      pause: pauseFocus,
      resume: resumeFocus,
      update: setMarkerFocus,
    } = this.mapStateStore.subscribeInteractionInfo('focus', 'defaultMarker')

    this.pauseFocus = pauseFocus
    this.setMarkerFocus = setMarkerFocus

    // 将点位关联任务渲染到地图上
    const {
      resume: resumeUpdateMLRenderList,
      pause: pauseUpdateMLRenderList,
    } = pausableWatch(linkList, async (list) => {
      await this.mapStateStore.setMLRenderList(list.map(({ fromId, linkAction, toId }) => ({
        source: fromId!,
        target: toId!,
        type: linkAction as GSMapState.MLRenderUnit['type'],
      })))
    }, { immediate: false })

    this.resumeUpdateMLRenderList = resumeUpdateMLRenderList
    this.pauseUpdateMLRenderList = pauseUpdateMLRenderList

    // 任务结束时清理状态
    onClear(() => {
      resumeFocus()
      this.mapStateStore.setIsPopoverOnHover(false)
      this.mapStateStore.setMLRenderList([])
      this.mapStateStore.event.off('click', this.handleMapClick)
      this.resetSelectedState()
      this.linkList.value = []
      pauseUpdateMLRenderList()
    })
  }

  protected mapStateStore = useMapStateStore()

  protected clearMission: () => void

  protected pauseFocus: () => void

  protected setMarkerFocus: (value: GSMapState.MarkerWithRenderConfig | null) => void

  protected resumeUpdateMLRenderList: () => void

  protected pauseUpdateMLRenderList: () => void

  protected resetSelectedState = () => {
    this.sourceMarker.value = undefined
    this.targetMarker.value = undefined
    this.sourceLinkList.value = []
    this.targetLinkList.value = []
  }

  protected mergeMarkerLinkList = (...args: API.MarkerLinkageVo[][]): API.MarkerLinkageVo[] => {
    const mergedList: API.MarkerLinkageVo[] = []
    const keys = new Set<string>()

    this.linkList.value.forEach((link) => {
      keys.add(this.getLinkKey({ fromId: link.fromId!, toId: link.toId!, linkAction: link.linkAction as LinkActionEnum }))
      mergedList.push(link)
    })

    args.forEach((list) => {
      list.forEach((link) => {
        const key = this.getLinkKey({ fromId: link.fromId!, toId: link.toId!, linkAction: link.linkAction as LinkActionEnum })
        if (keys.has(key))
          return
        keys.add(key)
        mergedList.push(link)
      })
    })

    return mergedList
  }

  protected selectSourceMarker = async (marker: GSMapState.MarkerWithRenderConfig) => {
    this.sourceMarker.value = marker
    this.targetMarker.value = undefined

    const markerLinkList: API.MarkerLinkageVo[] = []
    await db.markerLink
      .where('groupId')
      .equals(marker.linkageId!)
      .each(link => markerLinkList.push(link))

    this.sourceLinkList.value = markerLinkList
    this.targetLinkList.value = []

    this.updateMission(this.mergeMarkerLinkList(markerLinkList))
  }

  protected selectTargetMarker = async (marker: GSMapState.MarkerWithRenderConfig) => {
    this.targetMarker.value = marker

    const markerLinkList: API.MarkerLinkageVo[] = []
    await db.markerLink
      .where('groupId')
      .equals(marker.linkageId!)
      .each(link => markerLinkList.push(link))

    this.targetLinkList.value = markerLinkList

    this.updateMission(this.mergeMarkerLinkList(this.sourceLinkList.value, markerLinkList))
  }

  protected handleMapClick = async (info: PickingInfo, event: { leftButton?: boolean }) => {
    // 确认是否处于点位关联任务中
    if (!this.isMissionProcessing.value)
      return

    // 确认点击对象是否为点位
    if (!event.leftButton || !(info.sourceLayer instanceof GSMarkerLayer))
      return

    // 当没有源点时，设置源点
    if (this.sourceMarker.value === undefined) {
      const marker = this.mapStateStore.currentLayerMarkersMap[info.object as number]
      if (!marker)
        throw new Error('源点位不在地图上')
      await this.selectSourceMarker(marker)
      return
    }

    if (this.sourceMarker.value.id === info.object) {
      this.resetSelectedState()
      this.updateMission(this.linkList.value)
      return
    }

    // 当没有目标点时，设置目标点
    if (this.targetMarker.value === undefined) {
      const marker = this.mapStateStore.currentLayerMarkersMap[info.object as number]
      if (!marker)
        throw new Error('目标点位不在地图上')
      await this.selectTargetMarker(marker)
      return
    }

    // 再次点击目标点时，将当前关联加入到关联列表
    if (this.targetMarker.value.id === info.object) {
      this.putLink({
        fromId: this.sourceMarker.value.id!,
        toId: this.targetMarker.value.id!,
        linkAction: this.linkAction.value,
      })
      return
    }

    // 否则点击任何其他点时，取消当前的选择状态，但保留已添加的关联
    this.resetSelectedState()
    this.updateMission(this.linkList.value)
  }
}
