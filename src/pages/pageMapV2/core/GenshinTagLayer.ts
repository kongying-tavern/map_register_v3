import { COORDINATE_SYSTEM } from '@deck.gl/core/typed'
import { TextLayer } from '@deck.gl/layers/typed'
import type { TagOptions } from '../config'

export interface GenshinTagLayerProps {
  data: TagOptions[]
}

export class GenshinTagLayer extends TextLayer<TagOptions> {
  constructor(props: GenshinTagLayerProps) {
    const { data } = props
    super({
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      coordinateOrigin: [0, 0, 0],
      data,
      fontFamily: 'MHYG, Monaco, monospace',
      fontWeight: 'bold',
      getColor: [0, 0, 0, 0],
      getBackgroundColor: [0, 0, 0, 128],
      getBorderWidth: 2,
      getSize: ({ fontSize = 32 }) => fontSize,
      getText: d => d.text,
      getPosition: d => [...d.pos, 0],
    })
  }
}
