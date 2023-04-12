import type { IconLayerProps } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import type { MarkerWithIcon } from '@/pages/pageMapV2/core/GenshinBaseLayer'
import { useCondition } from '@/pages/pageMapV2/hooks'

/** 点位渲染属性 */
export const getIconLayerPropsFrom = (target: GenshinBaseLayer): IconLayerProps<MarkerWithIcon> => {
  const { center } = target.rawProps
  const conditionManager = useCondition()

  // TODO 优化可能
  // 由于每个 marker 有多个物品，但并不是每个物品在预渲染时都会被 iconMap 收集，这里只能去找存在于 iconMap 里的物品
  const getMarkerIcon = (items: API.MarkerItemLinkVo[] = []) => {
    for (const { itemId = -1 } of items) {
      const res = conditionManager.iconMap.get(itemId)
      if (res)
        return res
    }
  }

  const getMarkers = () => {
    if (conditionManager.conditionStateId === target.conditionId)
      return target.markers

    let markers: MarkerWithIcon[] = []
    conditionManager.conditions.forEach((condition) => {
      if (!target.rawProps.areaCodes.includes(condition.area.code as string))
        return
      markers = markers.concat(condition.markers.map(marker => ({
        ...marker,
        iconUrl: getMarkerIcon(marker.itemList) ?? '',
      })))
    })
    target.markers = markers
    target.conditionId = conditionManager.conditionStateId

    return markers
  }

  return {
    id: `${target.props.id}-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: getMarkers(),
    pickable: true,
    getIcon: (marker) => {
      return {
        url: marker.iconUrl,
        width: 40,
        height: 50,
        anchorX: 20,
        anchorY: 50,
      }
    },
    getSize: 40,
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: 40 * 2 ** (target.context.deck.mainViewState.zoom + 2),
    getColor: [255, 255, 255, 255],
    getPosition: (d) => {
      const [x, y] = d.position?.split(',').map(Number) as [number, number]
      return [x + center[0], y + center[1], 0]
    },
  }
}
