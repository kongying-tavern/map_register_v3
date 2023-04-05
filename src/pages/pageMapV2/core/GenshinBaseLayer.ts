import type { LayersList } from '@deck.gl/core/typed'
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core/typed'
import { TileLayer } from '@deck.gl/geo-layers/typed'
import { LineLayer, TextLayer } from '@deck.gl/layers/typed'
import type { ValueOf } from 'element-plus/es/components/table/src/table-column/defaults'
import { LAYER_CONFIGS } from '../config'
import type { LayerConfig, TagOptions } from '../config'
import { getBorderPropsFrom, getTagsPropsFrom, getTilePropsFrom } from '../utils'
import type { GenshinMap } from './GenshinMap'

export interface GenshinTileLayerProps extends Required<LayerConfig> {
  bounds: [number, number, number, number]
  groupedTags: TagOptions[][]
  coordinateSystem: ValueOf<typeof COORDINATE_SYSTEM>
  coordinateOrigin: [number, number, number]
}

export class GenshinBaseLayer extends CompositeLayer<GenshinTileLayerProps> {
  static get ID_PREFIX() { return 'genshin-layer-group-' }
  static get layerName() { return 'GenshinTileLayer' }

  /** 根据 code 获取对应图层实例，必须返回新实例。 */
  static getLayer = (code?: string) => {
    if (!code)
      return
    const findConfig = LAYER_CONFIGS.find(config => config.code === code)
    if (!findConfig)
      return
    const { size, tilesOffset = [0, 0], center = [0, 0], ...rest } = findConfig
    return new this({ ...rest, code, size, tilesOffset, center })
  }

  declare context: CompositeLayer['context'] & {
    deck: GenshinMap
  }

  readonly rawProps: GenshinTileLayerProps

  state = {
    ...super.state,
    showBorder: false,
    showTag: false,
    zoom: 0,
  }

  constructor(props: LayerConfig) {
    const {
      extension = 'png',
      tilesOffset = [0, 0],
      center = [0, 0],
      tags = [],
      areaCodes = [],
      initViewState = {},
    } = props
    const {
      zoom = -4,
      minZoom = -4,
      maxZoom = 0,
    } = initViewState

    super({ id: `${GenshinBaseLayer.ID_PREFIX}${props.code}` })

    const xmin = -tilesOffset[0]
    const ymin = -tilesOffset[1]
    const xmax = props.size[0] - tilesOffset[0]
    const ymax = props.size[1] - tilesOffset[1]
    const bounds: [number, number, number, number] = [xmin, ymax, xmax, ymin]

    this.rawProps = {
      code: props.code,
      name: props.name,
      size: props.size,
      extension,
      tilesOffset,
      center,
      bounds,
      tags,
      groupedTags: tags.reduce((seed, { level = 0, ...rest }) => {
        !(level in seed) && (seed[level] = [])
        seed[level].push({ level, ...rest })
        return seed
      }, [] as TagOptions[][]),
      areaCodes,
      initViewState: { zoom, minZoom, maxZoom },
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      coordinateOrigin: [center[0], center[1], 0] as [number, number, number],
    }
  }

  #getTileProps = () => getTilePropsFrom(this)
  #getTagsProps = () => getTagsPropsFrom(this)
  #getBorderProps = () => getBorderPropsFrom(this)

  setState = (state: Partial<typeof this.state>) => {
    super.setState(state)
  }

  renderLayers = (): LayersList => {
    return [
      new TileLayer(this.#getTileProps()),
      ...this.#getTagsProps().map(tagProps => new TextLayer(tagProps)),
      new LineLayer(this.#getBorderProps()),
    ]
  }
}