import { IconLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithRenderConfig } from '../core'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { ICON } from '@/pages/pageMapV2/config'

export const getMovingMarkersIconFrom = (target: GenshinBaseLayer): IconLayer<{ origin: MarkerWithRenderConfig; offset: API.Coordinate2D }> | null => {
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
    data: target.context.deck.store.map.getMission('moveMarkers') ?? [],
    pickable: true,
    iconAtlas: conditionManager.spiritImage,
    iconMapping: conditionManager.iconMapping,
    getIcon: ({ origin }) => {
      return `${origin.render.itemId}_${getMarkerPosition(origin)}_moving`
    },
    getSize: ICON.size.displaySize,
    getPosition: ({ origin, offset }) => {
      const [x, y] = origin.position!.split(',').map((strCoord, index) => Number(strCoord) + offset[index]) as [number, number]
      return target.context.deck.projectCoord([x, y])
    },
    sizeScale: 1,
    sizeMinPixels: 4,
    sizeMaxPixels: ICON.size.displaySize * 2 ** (target.context.deck.mainViewState.zoom + 2),
    transitions: {
      getSize: 66,
    },
  })
}
