import type { LayersList } from '@deck.gl/core/typed'
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core/typed'
import type { ValueOf } from 'element-plus/es/components/table/src/table-column/defaults'
import type { ShallowRef } from 'vue'
import { LAYER_CONFIGS, LAYER_OVERLAY_CONFIG } from '../config'
import type { LayerConfig, TagOptions } from '../config'
import { getBorderFrom, getMarkersFrom, getOverlaysFrom, getTagsFrom, getTilesFrom } from '../utils'
import type { GenshinMap } from './GenshinMap'
import { OverlayManager } from './OverlayManager'

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
      overlays = [],
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
      overlays,
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

    this.#overlayManager = shallowRef<OverlayManager>(new OverlayManager(LAYER_OVERLAY_CONFIG[this.rawProps.code]))
  }

  #markers = shallowRef<API.MarkerVo[]>([])
  get markers() { return this.#markers.value }
  set markers(v) { this.#markers.value = v }

  #overlayManager: ShallowRef<OverlayManager>
  get overlayManager() { return this.#overlayManager.value }

  setState = (state: Partial<typeof this.state>) => {
    super.setState(state)
  }

  /**
   * 通过更新时间戳来实现强制刷新图层
   * @注意
   * 1. 这里的状态更新不是最佳方案，但在 vue 的响应系统下比较有效
   * 2. 基于 WebGL 的重绘的开销是比较低的，但需要自己处理缓存，以避免数据的重复获取或处理
   * */
  forceUpdate = () => {
    this.setState({
      updateTimestamp: new Date().getTime(),
    })
  }

  renderLayers = (): LayersList => {
    return [
      getTilesFrom(this),
      ...getOverlaysFrom(this),
      ...getTagsFrom(this),
      getBorderFrom(this),
      getMarkersFrom(this),
    ]
  }
}
