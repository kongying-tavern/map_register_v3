import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { useArchiveStore } from '@/stores'
import { isMarkerVo } from '@/utils'

/** 点位渲染属性 */
export const getMarkersFrom = (target: GenshinBaseLayer): IconLayer<API.MarkerVo> => {
  const { center } = target.rawProps
  const conditionManager = useCondition()
  const { stateManager } = target.context.deck
  const archiveStore = useArchiveStore()

  // TODO 优化可能
  // 由于每个 marker 有多个物品，但并不是每个物品在预渲染时都会被 iconMap 收集，这里只能去找存在于 iconMap 里的物品
  const findValidItemId = (items: API.MarkerItemLinkVo[] = []) => {
    for (const { itemId = -1 } of items) {
      if (conditionManager.iconMapping[`${itemId}_default`] !== undefined)
        return itemId
    }
    return -1
  }

  const getMarkerState = (id?: number) => {
    const { hover, active, focus } = stateManager.state
    if (isMarkerVo(focus) && id === focus.id)
      return 'focus'
    if (isMarkerVo(active) && id === active.id)
      return 'active'
    if (isMarkerVo(hover) && id === hover.id)
      return 'hover'
    return 'default'
  }

  return new IconLayer({
    id: `${target.props.id}-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: conditionManager.layerMarkerMap[target.rawProps.code],
    pickable: true,
    iconAtlas: conditionManager.spiritImage,
    iconMapping: conditionManager.iconMapping,
    getIcon: (marker) => {
      const isMarked = archiveStore.currentArchive.body.Data_KYJG.has(marker.id as number)
      const state = isMarked ? 'marked' : getMarkerState(marker.id)
      const validItemId = findValidItemId(marker.itemList)
      return `${validItemId}${marker.extra?.underground?.is_underground ? '_ug' : ''}_${state}`
    },
    getSize: 40,
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: 40 * 2 ** (target.context.deck.mainViewState.zoom + 2),
    updateTriggers: {
      getIcon: [
        stateManager.state.hover,
        stateManager.state.active,
        stateManager.state.focus,
      ],
    },
    getPosition: (d) => {
      const [x, y] = d.position?.split(',').map(Number) as [number, number]
      return [x + center[0], y + center[1], 0]
    },
  })
}
