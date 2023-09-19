import { LineLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer, MarkerWithRenderConfig } from '../core'

export const getMovingMarkersLineFrom = (target: GenshinBaseLayer): LineLayer<{ origin: MarkerWithRenderConfig; offset: API.Coordinate2D }> | null => {
  return new LineLayer({
    id: `${target.props.id}-moving-markers-line`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    data: target.state.movingMarkers,
    getSourcePosition: ({ origin }) => {
      const pos = origin.position!.split(',').map(Number) as API.Coordinate2D
      return target.context.deck.projectCoord(pos)
    },
    getTargetPosition: ({ origin, offset }) => {
      const pos = origin.position!.split(',').map((strCoord, index) => Number(strCoord) + offset[index]) as [number, number]
      return target.context.deck.projectCoord(pos)
    },
    getWidth: 2,
    getColor: [255, 255, 0],
  })
}
