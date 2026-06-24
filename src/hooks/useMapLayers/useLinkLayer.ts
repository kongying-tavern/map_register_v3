import type { Coordinate2D, GSLinkLayerProps, MarkerLinkMission } from '@/packages/map'
import type { LinkActionEnum } from '@/shared'
import { useSubscription } from '@vueuse/rxjs'
import { filter } from 'rxjs'
import { GSLinkLayer, GSMarkerLayer } from '@/packages/map'
import { LINK_CONFIG_MAP, MapSubject } from '@/shared'
import { useMapStateStore, useMarkerLinkStore, useMarkerStore, useTileStore } from '@/stores'

const isEqualArray = (a: string[], b: string[]) => {
  // 1. 严格引用相等（最快路径）
  if (a === b)
    return true
  // 2. 判空与长度检查
  if (!a || !b)
    return false
  const len = a.length
  if (len !== b.length)
    return false
  // 3. 倒序 while 循环（减少反向查找和局部变量比较开销）
  let i = len
  while (i--) {
    if (a[i] !== b[i])
      return false
  }
  return true
}

export const useLinkLayer = () => {
  const markerStore = useMarkerStore()
  const markerLinkStore = useMarkerLinkStore()
  const mapStateStore = useMapStateStore()
  const tileStore = useTileStore()

  const { data: rewritePositions } = mapStateStore.subscribeMission('markerDragging', () => new Map())
  const { isProcessing: isLinking, data: missionLinks } = mapStateStore.subscribeMission('markerLink', () => [])
  const { isProcessing: isMultiSelecting } = mapStateStore.subscribeMission('markerMultiSelect', () => '')

  // 点位关联 focus 逻辑
  useSubscription(MapSubject.click.pipe(
    filter(({ event }) => [
      !isMultiSelecting.value,
      event.leftButton,
    ].every(Boolean)),
  ).subscribe(({ info }) => {
    if (!info.object || !(info.layer instanceof GSLinkLayer)) {
      mapStateStore.interaction.removeFocus(GSLinkLayer.layerName)
      return
    }
    const linkInfo = info.object as GSLinkLayerProps['data'][number]
    const oldHover = mapStateStore.interaction.focusElements.get(GSLinkLayer.layerName) as (Set<string> | undefined)
    if (oldHover?.has(linkInfo.id))
      return
    mapStateStore.interaction.setFocus(GSLinkLayer.layerName, new Set([linkInfo.id]))
  }))

  // 关联 hover
  useSubscription(MapSubject.hover.subscribe(({ info }) => {
    if (!(info.layer instanceof GSLinkLayer) || !info.object) {
      mapStateStore.interaction.removeHover(GSLinkLayer.layerName)
      mapStateStore.interaction.removeHover(GSMarkerLayer.layerName)
      return
    }
    const linkInfo = info.object as GSLinkLayerProps['data'][number]
    if (!linkInfo.id)
      return
    const oldHover = mapStateStore.interaction.hoverElements.get(GSLinkLayer.layerName) as (Set<string> | undefined)
    if (oldHover?.has(linkInfo.id!))
      return
    mapStateStore.interaction.setHover(GSLinkLayer.layerName, new Set([linkInfo.id!]))
    if (linkInfo.id.startsWith('temp'))
      return
    const linkId = Number(linkInfo.id)
    if (Number.isNaN(linkId))
      return
    const link = markerLinkStore.idMap.get(linkId)
    if (!link)
      return
    mapStateStore.interaction.setHover(GSMarkerLayer.layerName, new Set([link.fromId!, link.toId!]))
  }))

  /** 用于渲染的真实关联组 id */
  const renderRealLinkGroupIds = computed<string[]>(() => {
    if (isMultiSelecting.value)
      return []
    const linkGroupIds = new Set<string>()
    missionLinks.value.forEach(({ fromId, toId }) => {
      const fromMarker = markerStore.idMap.get(fromId!)
      if (fromMarker?.linkageId)
        linkGroupIds.add(fromMarker.linkageId)
      const toMarker = markerStore.idMap.get(toId!)
      if (toMarker?.linkageId)
        linkGroupIds.add(toMarker.linkageId)
    })
    const focusMarkerIds = mapStateStore.interaction.focusElements.get(GSMarkerLayer.layerName) as (Set<number> | undefined)
    if (!focusMarkerIds?.size)
      return [...linkGroupIds]
    focusMarkerIds.forEach((markerId) => {
      const markerInfo = markerStore.idMap.get(markerId)
      if (!markerInfo?.linkageId)
        return
      linkGroupIds.add(markerInfo.linkageId)
    })
    return [...linkGroupIds]
  })

  /** 用于渲染的真实关联连线（后端有实际数据） */
  const renderRealLinks = shallowRef<MarkerLinkMission[]>([])
  // 异步查询实际的关联数据（避免本地污染）
  watch(() => renderRealLinkGroupIds.value, async (groupIds, oldGroupIds = []) => {
    if (isEqualArray(groupIds, oldGroupIds))
      return
    if (!groupIds.length) {
      renderRealLinks.value = []
      return
    }
    let isCurrent = true
    onWatcherCleanup(() => {
      isCurrent = false
    })
    const { data: linkGroups = {} } = await Apis.marker_link.getMarkerLinkageList({
      cacheFor: {
        mode: 'memory',
        expire: 60 * 1000,
      },
      data: {
        groupIds,
      },
    })
    if (!isCurrent)
      return
    const links = Object.values(linkGroups)
      .flat(1)
      .map(link => ({
        ...link,
        meta: {
          key: `${link.id}`,
        },
      }))
    renderRealLinks.value = links
  }, { immediate: true })

  /** 用于渲染的临时关联 id */
  const renderTempLinks = computed(() => {
    if (isMultiSelecting.value)
      return []
    return missionLinks.value.filter(({ groupId }) => {
      return !groupId
    })
  })

  /** 实际可见的关联连线 */
  const renderLinks = computed(() => {
    const set = missionLinks.value.reduce((cur, { meta }) => {
      return cur.add(meta.key)
    }, new Set<string>())
    const links = [...renderRealLinks.value, ...renderTempLinks.value]
    if (!isLinking.value)
      return links
    // 如果正在处理关联任务，则过滤掉【待删除】的连线
    return links.filter(({ meta }) => set.has(meta.key))
  })

  // 渲染被关联带出的点位
  watch(renderLinks, () => {
    if (!renderLinks.value?.length) {
      mapStateStore.setTempMarkers('markerLink', [])
      return
    }
    const result = renderLinks.value.reduce((result, link) => {
      const markerFrom = markerStore.idMap.get(link.fromId!)
      markerFrom && result.push(markerFrom)
      const markerTo = markerStore.idMap.get(link.toId!)
      markerTo && result.push(markerTo)
      return result
    }, [] as API.MarkerVo[])
    mapStateStore.setTempMarkers('markerLink', result)
  }, { immediate: true })

  /** 关联图层建立 */
  const linkLayer = computed<GSLinkLayer | undefined>(() => {
    if (!renderLinks.value.length)
      return

    const positionCache = new Map<number, Coordinate2D>()

    const data = renderLinks.value.reduce((result, { fromId, toId, linkAction, meta }) => {
      const from = markerStore.idMap.get(fromId!)
      if (!from?.position)
        return result
      if (!positionCache.has(fromId!)) {
        const fromPosition = from.position.split(',').map(Number)
        if (fromPosition.length < 2)
          return result
        positionCache.set(fromId!, fromPosition as Coordinate2D)
      }
      const to = markerStore.idMap.get(toId!)
      if (!to?.position)
        return result
      if (!positionCache.has(toId!)) {
        const toPosition = to.position.split(',').map(Number)
        if (toPosition.length < 2)
          return result
        positionCache.set(toId!, toPosition as Coordinate2D)
      }
      const color = LINK_CONFIG_MAP.get(linkAction as LinkActionEnum)?.lineColor
      if (!color)
        return result
      result.push({
        id: meta.key,
        from: rewritePositions.value.get(fromId!) ?? tileStore.toMapCoordinate(positionCache.get(fromId!)!),
        to: rewritePositions.value.get(toId!) ?? tileStore.toMapCoordinate(positionCache.get(toId!)!),
        color,
      })
      return result
    }, [] as {
      id: string
      from: Coordinate2D
      to: Coordinate2D
      color: [r: number, g: number, b: number]
    }[])

    const focusIds = mapStateStore.interaction.focusElements.get(GSLinkLayer.layerName) as (Set<string> | undefined)

    return new GSLinkLayer({
      id: 'genshin-link',
      focusIds,
      hoverIds: mapStateStore.interaction.hoverElements.get(GSLinkLayer.layerName) as (Set<string> | undefined),
      data,
    })
  })

  return {
    linkLayer,
  }
}
