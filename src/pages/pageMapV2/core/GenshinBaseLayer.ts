import type { LayersList } from '@deck.gl/core/typed'
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core/typed'
import { TileLayer } from '@deck.gl/geo-layers/typed'
import { IconLayer, LineLayer, TextLayer } from '@deck.gl/layers/typed'
import type { ValueOf } from 'element-plus/es/components/table/src/table-column/defaults'
import { LAYER_CONFIGS } from '../config'
import type { LayerConfig, TagOptions } from '../config'
import { getBorderPropsFrom, getIconLayerPropsFrom, getTagsPropsFrom, getTilePropsFrom } from '../utils'
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
    updateTimestamp: new Date().getTime(),
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
      initViewState,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      coordinateOrigin: [center[0], center[1], 0] as [number, number, number],
    }
  }

  /** 缓存的条件管理器的状态 id，以简化脏检查 */
  #conditionId = ref('')
  get conditionId() { return this.#conditionId.value }
  set conditionId(v) { this.#conditionId.value = v }

  #markers = shallowRef<(API.MarkerVo)[]>([])
  get markers() { return this.#markers.value }
  set markers(v) { this.#markers.value = v }

  #getTileProps = () => getTilePropsFrom(this)
  #getTagsProps = () => getTagsPropsFrom(this)
  #getBorderProps = () => getBorderPropsFrom(this)
  #getIconProps = () => getIconLayerPropsFrom(this)

  setState = (state: Partial<typeof this.state>) => {
    super.setState(state)
  }

  forceUpdate = () => {
    this.setState({
      updateTimestamp: new Date().getTime(),
    })
  }

  renderLayers = (): LayersList => {
    return [
      new TileLayer(this.#getTileProps()),
      ...this.#getTagsProps().map(tagProps => new TextLayer(tagProps)),
      new IconLayer(this.#getIconProps()),
      new LineLayer(this.#getBorderProps()),
    ]
  }
}
