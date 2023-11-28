import type { LayersList } from '@deck.gl/core/typed'
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core/typed'
import type { ValueOf } from 'element-plus/es/components/table/src/table-column/defaults'
import {
  getBorderFrom,
  getMarkersFrom,
  getMovingMarkersIconFrom,
  getMovingMarkersLineFrom,
  getOverlayMaskFrom,
  getOverlaysFrom,
  getTagsFrom,
  getTilelikeOverlaysFrom,
  getTilesFrom,
} from '../utils'
import type { GSCompositeLayerTypes } from './layer/GSCompositeLayerTypes'
import type { GenshinMap } from '.'
import type { AreaTileConfig } from '@/stores'
import { Logger } from '@/utils'

export type BaseLayerProps = AreaTileConfig['tile'] & {
  bounds: [number, number, number, number]
  coordinateSystem: ValueOf<typeof COORDINATE_SYSTEM>
  coordinateOrigin: [number, number, number]
}

const logger = new Logger('[genshin base layer]')

export class GenshinBaseLayer extends CompositeLayer<GSCompositeLayerTypes> {
  static get ID_PREFIX() { return 'tile-' }
  static get layerName() { return 'GenshinTileLayer' }

  declare context: CompositeLayer['context'] & {
    deck: GenshinMap
  }

  readonly rawProps: BaseLayerProps

  state = {
    timestamp: Date.now(),
  }

  setState = (state: Partial<typeof this.state>) => {
    super.setState(state)
  }

  forceUpdate = () => {
    this.setState({ timestamp: Date.now() })
  }

  constructor(props: AreaTileConfig) {
    super({
      id: `${GenshinBaseLayer.ID_PREFIX}${props.tile.code}`,
    })

    const {
      center,
      size: [w, h],
      tilesOffset: [ox, oy],
    } = props.tile

    const xmin = ox
    const ymin = oy
    const xmax = w + ox
    const ymax = h + oy
    const bounds: [number, number, number, number] = [xmin, ymax, xmax, ymin]

    this.rawProps = {
      ...props.tile,
      bounds,
      coordinateOrigin: [...center, 0],
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    }

    logger.info(this.props)
  }

  renderLayers = (): LayersList => {
    return [
      getTilesFrom(this),
      getTilelikeOverlaysFrom(this),
      getOverlayMaskFrom(this),
      getOverlaysFrom(this),
      getTagsFrom(this),
      getBorderFrom(this),
      getMarkersFrom(this),
      getMovingMarkersLineFrom(this),
      getMovingMarkersIconFrom(this),
    ]
  }
}
