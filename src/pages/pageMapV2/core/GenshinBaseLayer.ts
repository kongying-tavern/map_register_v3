import type { LayersList } from '@deck.gl/core/typed'
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core/typed'
import type { ValueOf } from 'element-plus/es/components/table/src/table-column/defaults'
import { LAYER_CONFIGS } from '../config'
import type { LayerConfig, TagOptions } from '../config'
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
import type { Coordinate2D, GenshinMap } from '.'
import { useMapSettingStore, useMapStore, useOverlayStore } from '@/stores'

export interface GenshinTileLayerConfig extends Required<LayerConfig> {
  bounds: [number, number, number, number]
  groupedTags: TagOptions[][]
  coordinateSystem: ValueOf<typeof COORDINATE_SYSTEM>
  coordinateOrigin: [number, number, number]
}

export class GenshinBaseLayer extends CompositeLayer {
  static get ID_PREFIX() { return 'genshin-layer-group-' }
  static get layerName() { return 'GenshinTileLayer' }

  static unsubscribers: (() => void)[] = []

  /** 根据 code 获取对应图层实例，必须返回新实例。 */
  static getLayer = (code?: string) => {
    if (!code)
      return
    const findConfig = LAYER_CONFIGS.find(config => config.code === code)
    if (!findConfig)
      return
    const { size, tilesOffset = [0, 0], center = [0, 0], ...rest } = findConfig

    const layer = new this({ ...rest, code, size, tilesOffset, center })

    this.unsubscribers.forEach(unsubscriber => unsubscriber())
    this.unsubscribers = [
      useMapSettingStore().$subscribe((_, state) => layer.setState(state)),
      useMapStore().$subscribe((_, state) => layer.setState(state)),
      useOverlayStore().$subscribe((_, state) => layer.setState(state)),
    ]

    return layer
  }

  declare context: CompositeLayer['context'] & {
    deck: GenshinMap
  }

  readonly rawProps: GenshinTileLayerConfig

  #getDefaultState = () => ({
    updateCount: 0 as number,
    movingMarkers: [] as { origin: API.MarkerVo; offset: Coordinate2D }[],
    ...useMapSettingStore().$state,
    ...useMapStore().$state,
    ...useOverlayStore().$state,
  })

  state = this.#getDefaultState()

  /** Layer 类在初始化时会清空 state 导致子图层无法访问到必要的 state，这里覆盖一下 */
  _initialize = () => {
    super._initialize()
    this.state = this.#getDefaultState()
  }

  setState = (state: Partial<typeof this.state>) => {
    super.setState(state)
  }

  forceUpdate = () => this.setState({
    updateCount: (this.state.updateCount ?? 0) + 1,
  })

  constructor(props: LayerConfig) {
    const {
      extension = 'png',
      tilesOffset = [0, 0],
      center = [0, 0],
      tags = [],
      areaCodes = [],
      initViewState = {},
    } = props

    super({
      id: `${GenshinBaseLayer.ID_PREFIX}${props.code}`,
    })

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
