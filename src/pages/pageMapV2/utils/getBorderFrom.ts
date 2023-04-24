import { LineLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'

export interface GenshinLineData {
  start: [number, number]
  end: [number, number]
}

export const getBorderFrom = (target: GenshinBaseLayer): LineLayer<GenshinLineData> => {
  const [xmin, ymax, xmax, ymin] = target.rawProps.bounds
  return new LineLayer({
    id: `${target.props.id}-border`,
    coordinateSystem: target.rawProps.coordinateSystem,
    coordinateOrigin: target.rawProps.coordinateOrigin,
    visible: target.context.deck.stateManager.get('showBorder'),
    data: [
      { start: [xmin, ymax], end: [xmax, ymax] },
      { start: [xmax, ymax], end: [xmax, ymin] },
      { start: [xmax, ymin], end: [xmin, ymin] },
      { start: [xmin, ymin], end: [xmin, ymax] },
    ],
    getWidth: 1,
    getColor: () => [255, 0, 0, 255],
    getSourcePosition: d => d.start,
    getTargetPosition: d => d.end,
  })
}
