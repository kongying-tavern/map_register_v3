import type { PickingInfo } from '@deck.gl/core/typed'
import { useMapStateStore } from '@/stores'
import { mapWindowContext as windowCtx } from '@/pages/pageMapV2/components'
import { GSMarkerLayer } from '@/pages/pageMapV2/core/layer'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import db from '@/database'
import { LinkActionEnum } from '@/shared'

interface MarkerLinkProps {
  key: string
  fromId: number
  toId: number
  linkAction: LinkActionEnum
  isDelete?: boolean
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

  /** 关联任务是否可用 */
  isMissionEnable: Ref<boolean>

  /** 是否正在进行关联任务 */
  isMissionProcessing: Ref<boolean>

  /** 点位关联提交状态 */
  loading = ref(false)
  setLoading = (v: boolean) => {
    this.loading.value = v
  }

  /** 新添加的关联 */
  linkList = ref<MarkerLinkProps[]>([])

  /** 已有的关联组，key 表示关联组 id */
  existLinkGroups = ref<Record<string, {
    /** 关联组包含的点位 id，当包含为空时，该关联组会被移除 */
    include: Set<number>
    /** 点位所属关联组对应的关联关系 */
    links: API.MarkerLinkageVo[]
  }>>({})

  /** 是否合并已有关联组 */
  isMergeMode = ref(true)
  setMergeMode = (v: boolean) => {
    this.isMergeMode.value = v
  }

  /** 最终将被提交的关联关系 */
  modifiedLinkList = computed<MarkerLinkProps[]>(() => {
    if (!this.isMergeMode.value)
      return this.linkList.value

    const mergedList: MarkerLinkProps[] = []
    const keys = new Set<string>()

    this.linkList.value.forEach((link) => {
      keys.add(link.key)
      !link.isDelete && mergedList.push(link)
    })

    const existLinks = this.existLinkGroups.value
    for (const linkageId in existLinks) {
      const { links } = existLinks[linkageId]
      links.forEach((link) => {
        const info = {
          fromId: link.fromId!,
          toId: link.toId!,
          linkAction: link.linkAction as LinkActionEnum,
          key: this.getLinkKey(link as Omit<MarkerLinkProps, 'key'>),
        }
        const key = this.getLinkKey(info)
        if (keys.has(key))
          return
        keys.add(key)
        mergedList.push({
          ...info,
          key,
        })
      })
    }

    return mergedList
  })

  /** 获取关联条目的唯一标识 */
  getLinkKey = ({ fromId, toId, linkAction }: Omit<MarkerLinkProps, 'key'>) => {
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
    this.resumeSync()
    this.resumeRender()
    // 切换 focus 与 hover 导致的点位弹窗行为
    this.mapStateStore.setIsPopoverOnHover(true)
    // 初始化关联任务
    this.updateMission([])
    // 打开点位关联弹窗
    windowCtx.openWindow({ id: this.id, name: '点位关联' })
  }

  /** 新增/修改关联关系 */
  putLink = (markerLink: MarkerLinkProps) => {
    const list = [...this.linkList.value]

    const findIndex = list.findIndex(link => link.key === markerLink.key)

    if (findIndex < 0)
      list.push(markerLink)
    else
      list.splice(findIndex, 1, markerLink)

    this.linkList.value = list
    this.resetSelectedState()
  }

  /** 删除关联关系 */
  deleteLink = (link: MarkerLinkProps) => {
    const list = [...this.linkList.value]

    const rewriteLink = {
      ...link,
      isDelete: true,
    }

    const findIndex = list.findIndex(({ key }) => link.key === key)
    if (findIndex < 0)
      list.push(rewriteLink)
    else
      list.splice(findIndex, 1, rewriteLink)

    this.linkList.value = list
    this.resetSelectedState()
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
      data: missionList,
      update,
      clear,
      onClear,
    } = this.mapStateStore.subscribeMission('markerLink', () => [])

    this.isMissionEnable = isEnable
    this.isMissionProcessing = isProcessing
    this.clearMission = clear
    this.updateMission = update

    // 同步内部更改与地图任务状态
    const { pause: pauseSync, resume: resumeSync } = pausableWatch(this.modifiedLinkList, (newLinkList) => {
      update(newLinkList)
    }, { immediate: false })

    this.pauseSync = pauseSync
    this.resumeSync = resumeSync

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
      pause: pauseRender,
      resume: resumeRender,
    } = pausableWatch(missionList, async (list) => {
      await this.mapStateStore.setMLRenderList(list.map(({ fromId = 0, linkAction, toId = 0 }) => ({
        key: this.getLinkKey({ fromId, toId, linkAction: linkAction as LinkActionEnum }),
        source: fromId!,
        target: toId!,
        type: linkAction as GSMapState.MLRenderUnit['type'],
      })))
    }, { immediate: false })

    this.pauseRender = pauseRender
    this.resumeRender = resumeRender

    // 任务结束时清理状态
    onClear(() => {
      resumeFocus()
      this.mapStateStore.setIsPopoverOnHover(false)
      this.mapStateStore.setMLRenderList([])
      this.mapStateStore.event.off('click', this.handleMapClick)
      this.resetSelectedState()
      this.linkList.value = []
      this.clearTempLink()
      pauseSync()
      pauseRender()
    })
  }

  protected mapStateStore = useMapStateStore()

  protected clearMission: () => void
  protected updateMission: (value: API.MarkerLinkageVo[] | null) => void

  protected pauseFocus: () => void
  protected setMarkerFocus: (value: GSMapState.MarkerWithRenderConfig | null) => void

  protected pauseRender: () => void
  protected resumeRender: () => void

  protected pauseSync: () => void
  protected resumeSync: () => void

  protected resetSelectedState = () => {
    this.sourceMarker.value = undefined
    this.targetMarker.value = undefined
  }

  /** 移除对应点位的已有关联组 */
  protected removeTempLink = (marker?: GSMapState.MarkerWithRenderConfig) => {
    if (!marker)
      return
    const group = this.existLinkGroups.value[marker.linkageId!]
    if (!group)
      return
    group.include.delete(marker.id!)
    if (group.include.size > 0)
      return
    delete this.existLinkGroups.value[marker.linkageId!]
  }

  protected clearTempLink = () => {
    this.existLinkGroups.value = {}
  }

  protected cancelSelect = () => {
    this.removeTempLink(this.sourceMarker.value)
    this.sourceMarker.value = undefined
    this.removeTempLink(this.targetMarker.value)
    this.targetMarker.value = undefined
  }

  protected selectSourceMarker = async (marker: GSMapState.MarkerWithRenderConfig) => {
    this.sourceMarker.value = marker
    this.targetMarker.value = undefined
    if (!this.existLinkGroups.value[marker.linkageId!]) {
      const existLinks = await db.markerLink.where('groupId').equals(marker.linkageId!).toArray()
      this.existLinkGroups.value[marker.linkageId!] = { include: new Set([marker.id!]), links: existLinks }
    }
    else {
      this.existLinkGroups.value[marker.linkageId!].include.add(marker.id!)
    }
  }

  protected selectTargetMarker = async (marker: GSMapState.MarkerWithRenderConfig) => {
    this.targetMarker.value = marker
    if (!this.existLinkGroups.value[marker.linkageId!]) {
      const existLinks = await db.markerLink.where('groupId').equals(marker.linkageId!).toArray()
      this.existLinkGroups.value[marker.linkageId!] = { include: new Set([marker.id!]), links: existLinks }
    }
    else {
      this.existLinkGroups.value[marker.linkageId!].include.add(marker.id!)
    }
  }

  protected handleMapClick = async (info: PickingInfo, event: { leftButton?: boolean }) => {
    // 确认是否符合触发条件
    if (!this.isMissionProcessing.value || !event.leftButton)
      return

    // 点击对象不为点位时，取消当前选择项
    if (!(info.sourceLayer instanceof GSMarkerLayer)) {
      this.cancelSelect()
      return
    }

    // 当没有源点时，设置源点
    if (this.sourceMarker.value === undefined) {
      const marker = this.mapStateStore.currentLayerMarkersMap[info.object as number]
      if (!marker)
        throw new Error('源点位不在地图上')
      await this.selectSourceMarker(marker)
      return
    }

    // 点击源点时，不做任何操作
    if (this.sourceMarker.value.id === info.object)
      return

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
      const link = {
        fromId: this.sourceMarker.value.id!,
        toId: this.targetMarker.value.id!,
        linkAction: this.linkAction.value,
      }
      this.putLink({
        ...link,
        key: this.getLinkKey(link),
      })
      return
    }

    // 否则点击任何其他点时，取消当前的选择状态，但保留已添加的关联
    this.cancelSelect()
  }
}
