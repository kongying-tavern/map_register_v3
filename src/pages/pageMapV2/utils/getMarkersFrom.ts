import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithExtra } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'

/** 点位渲染属性 */
export const getMarkersFrom = (target: GenshinBaseLayer): IconLayer<MarkerWithExtra> => {
  const { center } = target.rawProps
  const conditionManager = useCondition()
  const { stateManager } = target.context.deck

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
    return id === focus?.id
      ? 'focus'
      : id === active?.id
        ? 'active'
        : id === hover?.id
          ? 'hover'
          : 'default'
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
      const state = getMarkerState(marker.id)
      const validItemId = findValidItemId(marker.itemList)
      return `${validItemId}${marker.extraObject.underground?.is_underground ? '_ug' : ''}_${state}`
    },
    getSize: 40,
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: 40 * 2 ** (target.context.deck.mainViewState.zoom + 2),
    updateTriggers: {
      getIcon: [stateManager.state.hover, stateManager.state.active, stateManager.state.focus],
    },
    getPosition: (d) => {
      const [x, y] = d.position?.split(',').map(Number) as [number, number]
      return [x + center[0], y + center[1], 0]
    },
  })
}
