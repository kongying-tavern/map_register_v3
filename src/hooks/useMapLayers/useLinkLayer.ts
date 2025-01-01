import { useSubscription } from '@vueuse/rxjs'
import { type Coordinate2D, GSLinkLayer, type GSLinkLayerProps, GSMarkerLayer, type MarkerLinkMission } from '@/packages/map'
import type { LinkActionEnum } from '@/shared'
import { LINK_CONFIG_MAP, MapSubject } from '@/shared'
import { useMapStateStore, useMarkerLinkStore, useMarkerStore, useTileStore } from '@/stores'

export const useLinkLayer = () => {
  const markerStore = useMarkerStore()
  const markerLinkStore = useMarkerLinkStore()
  const mapStateStore = useMapStateStore()
  const tileStore = useTileStore()

  const { data: rewritePositions } = mapStateStore.subscribeMission('markerDragging', () => new Map())
  const { data: missionLinks } = mapStateStore.subscribeMission('markerLink', () => [])
  const { isProcessing: isMultiSelecting } = mapStateStore.subscribeMission('markerMultiSelect', () => [])

  const interactionKey = GSLinkLayer.layerName

  // 关联暂无 focus 逻辑
  // TODO 后续为关联连线添加弹出菜单，点击菜单进入到关联的编辑功能中

  // 关联 hover
  useSubscription(MapSubject.hover.subscribe(({ info }) => {
    if (!(info.layer instanceof GSLinkLayer) || !info.object) {
      mapStateStore.interaction.removeHover(interactionKey)
      mapStateStore.interaction.removeHover(GSMarkerLayer.layerName)
      return
    }
    const linkInfo = info.object as GSLinkLayerProps['data'][number]
    if (!linkInfo.id)
      return
    const oldHover = mapStateStore.interaction.hoverElements.get(interactionKey) as (Set<string> | undefined)
    if (oldHover?.has(linkInfo.id!))
      return
    mapStateStore.interaction.setHover(interactionKey, new Set([linkInfo.id!]))
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

  /** 用于渲染的关联组 */
  const links = computed(() => {
    if (isMultiSelecting.value)
      return []
    const linkIds = new Set<string>()
    const result: MarkerLinkMission[] = []
    missionLinks.value.forEach((link) => {
      if (linkIds.has(link.meta.key))
        return
      result.push(link)
      linkIds.add(link.meta.key)
    })
    const focusMarkerIds = mapStateStore.interaction.focusElements.get(GSMarkerLayer.layerName) as (Set<number> | undefined)
    if (!focusMarkerIds?.size)
      return result
    return [...focusMarkerIds].reduce((resultLinks, markerId) => {
      const markerInfo = markerStore.idMap.get(markerId)
      if (!markerInfo?.linkageId)
        return resultLinks
      const markerLinks = markerLinkStore.groupIdMap.get(markerInfo.linkageId)
      if (!markerLinks?.length)
        return resultLinks
      markerLinks.forEach((link) => {
        const key = `${link.id}`
        if (linkIds.has(key))
          return
        resultLinks.push({
          ...link,
          meta: { key },
        })
        linkIds.add(key)
      })
      return resultLinks
    }, result)
  })

  watch(links, () => {
    if (!links.value?.length) {
      mapStateStore.setTempMarkers('markerLink', [])
      return
    }
    const result = links.value.reduce((result, link) => {
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
    if (!links.value.length)
      return

    const positionCache = new Map<number, Coordinate2D>()

    const data = links.value.reduce((result, { fromId, toId, linkAction, meta }) => {
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

    return new GSLinkLayer({
      id: 'genshin-link',
      hoverIds: mapStateStore.interaction.hoverElements.get(interactionKey) as (Set<string> | undefined),
      data,
    })
  })

  return {
    linkLayer,
  }
}
