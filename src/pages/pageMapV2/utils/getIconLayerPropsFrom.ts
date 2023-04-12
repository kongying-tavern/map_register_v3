import type { IconLayerProps } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'

export const getIconLayerPropsFrom = (target: GenshinBaseLayer): IconLayerProps<API.MarkerVo> => {
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
    let markers: API.MarkerVo[] = []
    conditionManager.conditions.forEach((condition) => {
      if (!target.rawProps.areaCodes.includes(condition.area.code as string))
        return
      markers = markers.concat(condition.markers)
    })
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
        id: `${marker.itemList?.[0]?.itemId ?? -1}`,
        url: getMarkerIcon(marker.itemList) ?? '',
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
