import type { IconLayerProps } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'

export const getIconLayerPropsFrom = (target: GenshinBaseLayer): IconLayerProps<API.MarkerVo> => {
  const { center } = target.rawProps
  return {
    id: `${target.props.id}-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: target.context.deck.markers,
    pickable: true,
    getIcon: (marker) => {
      return {
        url: target.context.deck.iconMap.get(marker.itemList?.[0].itemId as number) ?? '',
        width: 40,
        height: 40,
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
