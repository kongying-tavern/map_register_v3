import type { IconLayerProps } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithExtra } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import db from '@/database'
import { ExtraJSON } from '@/utils'

/** 点位渲染属性 */
export const getIconLayerPropsFrom = (target: GenshinBaseLayer): IconLayerProps<MarkerWithExtra> => {
  const { center } = target.rawProps
  const conditionManager = useCondition()

  // TODO 优化可能
  // 由于每个 marker 有多个物品，但并不是每个物品在预渲染时都会被 iconMap 收集，这里只能去找存在于 iconMap 里的物品
  const findValidItemId = (items: API.MarkerItemLinkVo[] = []) => {
    for (const { itemId = -1 } of items) {
      if (conditionManager.iconMapping[`${itemId}_default`] !== undefined)
        return itemId
    }
    return -1
  }

  // 重要：当筛选条件没变时，则直接从点位缓存返回，以节省遍历点位数据的开销
  const getMarkers = async () => {
    if (conditionManager.conditionStateId === target.conditionId)
      return target.markers

    // 筛选出只存在于当前图层的点位
    let itemIdsInThisLayer: number[] = []
    conditionManager.conditions.forEach((condition) => {
      if (!target.rawProps.areaCodes.includes(condition.area.code as string))
        return
      itemIdsInThisLayer = itemIdsInThisLayer.concat(condition.items)
    })
    const markers = await db.marker.where('itemIdList').anyOf(itemIdsInThisLayer).toArray()
    target.markers = markers.map(marker => ({
      ...marker,
      extraObject: ExtraJSON.parse(marker.extra ?? '{}'),
    }))
    target.conditionId = conditionManager.conditionStateId
    return markers
  }

  return {
    id: `${target.props.id}-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: getMarkers(),
    pickable: true,
    iconAtlas: conditionManager.spiritImage,
    iconMapping: conditionManager.iconMapping,
    getIcon: (marker) => {
      const { hover, active, focus } = target.context.deck
      const state = marker.id === focus?.id
        ? 'focus'
        : marker.id === active?.id
          ? 'active'
          : marker.id === hover?.id
            ? 'hover'
            : 'default'
      const validItemId = findValidItemId(marker.itemList)
      return `${validItemId}${marker.extraObject.underground?.is_underground ? '_ug' : ''}_${state}`
    },
    getSize: 40,
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: 40 * 2 ** (target.context.deck.mainViewState.zoom + 2),
    updateTriggers: {
      getIcon: [target.context.deck.hover, target.context.deck.active, target.context.deck.focus],
    },
    getPosition: (d) => {
      const [x, y] = d.position?.split(',').map(Number) as [number, number]
      return [x + center[0], y + center[1], 0]
    },
  }
}
