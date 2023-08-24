import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithRenderConfig } from '../core'
import type { Coordinate2D } from '@/pages/pageMapV2/core/GenshinMap'
import { useCondition } from '@/pages/pageMapV2/hooks'

export const getMovingMarkersIconFrom = (target: GenshinBaseLayer): IconLayer<{ origin: MarkerWithRenderConfig; offset: Coordinate2D }> | null => {
  const conditionManager = useCondition()

  const getMarkerPosition = (marker: API.MarkerVo) => {
    if (marker.extra?.underground?.is_underground)
      return 'underground'
    return 'aboveground'
  }

  return new IconLayer({
    id: `${target.props.id}-moving-markers`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: target.state.movingMarkers,
    pickable: true,
    iconAtlas: conditionManager.spiritImage,
    iconMapping: conditionManager.iconMapping,
    getIcon: ({ origin: marker }) => {
      return `${marker.render.itemId}_${getMarkerPosition(marker)}_moving`
    },
    getSize: 50,
    getPosition: ({ origin: marker, offset }) => {
      const [x, y] = marker.position!.split(',').map((strCoord, index) => Number(strCoord) + offset[index]) as [number, number]
      return target.context.deck.projectCoord([x, y])
    },
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: 50 * 2 ** (target.context.deck.mainViewState.zoom + 2),
  })
}
