import type { LayersList } from '@deck.gl/core/typed'
import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core/typed'
import type { NonGeoBoundingBox, TileLayerProps } from '@deck.gl/geo-layers/typed'
import { TileLayer } from '@deck.gl/geo-layers/typed'
import type { LineLayerProps, TextLayerProps } from '@deck.gl/layers/typed'
import { BitmapLayer, LineLayer, TextLayer } from '@deck.gl/layers/typed'
import { LAYER_CONFIGS } from '../config'
import type { LayerConfig, TagOptions } from '../config'
import type { GenshinMap } from './GenshinMap'

export interface GenshinTileLayerProps extends Required<LayerConfig> {
  bounds: [number, number, number, number]
}

export interface GenshinLineData {
  start: [number, number]
  end: [number, number]
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
      code,
      name,
      size,
      extension = 'png',
      tilesOffset = [0, 0],
      center = [0, 0],
      tags = [],
      areaCodes = [],
      initViewState = {},
    } = props

    super({ id: `${GenshinBaseLayer.ID_PREFIX}${code}` })
    super.initializeState(this.context)

    const xmin = -tilesOffset[0]
    const ymin = -tilesOffset[1]
    const xmax = size[0] - tilesOffset[0]
    const ymax = size[1] - tilesOffset[1]
    const bounds: [number, number, number, number] = [xmin, ymax, xmax, ymin]

    const {
      zoom = -4,
      minZoom = -4,
      maxZoom = 0,
    } = initViewState

    this.rawProps = {
      code,
      name,
      size,
      extension,
      tilesOffset,
      center,
      bounds,
      tags,
      areaCodes,
      initViewState: { zoom, minZoom, maxZoom },
    }

    const commonProps = {
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      coordinateOrigin: [center[0], center[1], 0] as [number, number, number],
    }

    this.#getTileProps = () => ({
      ...commonProps,
      id: `${this.props.id}-tile`,
      data: null,
      tileSize: 256,
      minZoom: -3, // 固定值，对应服务端存储底图的 level 10
      maxZoom: 0, // 固定值，对应服务端存储底图的 level 13
      maxRequests: 1,
      extent: bounds,
      getTileData: ({ index: { x, y, z }, signal }) => {
        if (signal?.aborted)
          return null
        return fetch(`https://assets.yuanshen.site/tiles_${code}/${z + 13}/${x}_${y}.${extension}`, {
          mode: 'cors',
          referrerPolicy: 'no-referrer',
        }).then(res => res.blob()).then(blob => createImageBitmap(blob))
      },
      renderSubLayers: (subProps) => {
        const { left, bottom, right, top } = subProps.tile.bbox as NonGeoBoundingBox
        return new BitmapLayer(subProps, {
          // 通过自定义 getTileData 函数获取图片，不需要 data 字段，必须明确指定为空
          data: undefined,
          image: subProps.data,
          bounds: [left, bottom, right, top],
        })
      },
    })

    const levelTags = this.rawProps.tags.reduce((seed, { level = 0, ...rest }) => {
      !(level in seed) && (seed[level] = [])
      seed[level].push({ level, ...rest })
      return seed
    }, [] as TagOptions[][])

    const commonTagProps: TextLayerProps<TagOptions> = {
      ...commonProps,
      data: [],
      id: '',
      characterSet: 'auto',
      fontFamily: 'MHYG, Monaco, monospace',
      fontWeight: 'bold',
      fontSettings: {
        buffer: 8,
      },
      getColor: [255, 255, 255, 255],
      getBorderColor: [0, 0, 0, 128],
      getBorderWidth: 2,
      sizeMaxPixels: 20,
      getSize: ({ fontSize = 20 }) => fontSize,
      getText: d => d.text,
      getPosition: ({ pos: [x, y] }) => [x + center[0], y + center[1], 0],
    }

    this.#getTagsProps = (): TextLayerProps<TagOptions>[] => {
      const { zoom } = this.context.deck.mainViewState
      return levelTags.map((tags, level) => ({
        ...commonTagProps,
        sizeScale: 2 ** (zoom + 2),
        id: `${this.props.id}-tag-level${level}`,
        visible: this.context.deck.showTag && (level === 0
          ? zoom > -2
          : level === 1
            ? zoom <= -2
            : zoom <= -4),
        data: tags,
      }))
    }

    this.#getBorderProps = () => ({
      ...commonProps,
      id: `${this.props.id}-border`,
      visible: this.context.deck.showBorder,
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

  setState = (state: Partial<typeof this.state>) => {
    super.setState(state)
  }

  #getTileProps: () => TileLayerProps
  #getTagsProps: () => TextLayerProps<TagOptions>[]
  #getBorderProps: () => LineLayerProps<GenshinLineData>

  renderLayers = (): LayersList => {
    return [
      new TileLayer(this.#getTileProps()),
      ...this.#getTagsProps().map(tagProps => new TextLayer(tagProps)),
      new LineLayer(this.#getBorderProps()),
    ]
  }
}
