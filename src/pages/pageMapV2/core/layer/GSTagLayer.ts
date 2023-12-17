import type { LayersList } from '@deck.gl/core/typed'
import { CompositeLayer } from '@deck.gl/core/typed'
import { TextLayer } from '@deck.gl/layers/typed'
import { MAP_FONTFAMILY } from '../../shared'
import type { GSCompositeLayerState, LayerAttachOptions } from '.'
import type { AreaTagTuple } from '@/configs'

export class GSTagLayer extends CompositeLayer<GSCompositeLayerState & LayerAttachOptions> {
  static layerName = 'GenshinTagLayer'

  constructor(state: GSCompositeLayerState, { zoom }: LayerAttachOptions) {
    super({
      id: 'genshin-tag-layer',
      ...state,
      zoom,
    })
  }

  renderLayers = (): LayersList => {
    const { visibleTagGroups, showZoneTag, zoom } = this.props
    const [cx, cy] = this.props.tileConfig!.tile.center

    const getTagOpacity = (level: number) => ({
      0: zoom > -1.5,
      1: zoom <= -1.5,
      2: zoom <= -4,
    })[level]
      ? 255
      : 0

    const getTagSize = (level: number) => ({
      0: 12,
      1: 32,
      2: 48,
    })[level] ?? 16

    return visibleTagGroups.map((tags, level) => new TextLayer<AreaTagTuple>({
      id: `genshin-tag-layer-${level}`,
      visible: showZoneTag,
      data: tags,
      characterSet: 'auto',
      fontFamily: `${MAP_FONTFAMILY}, Monaco, monospace`,
      fontSettings: {
        buffer: 8,
        sdf: true,
      },
      sizeMaxPixels: 32,
      sizeScale: 2 ** (zoom + 2),
      outlineColor: [102, 102, 102, getTagOpacity(level)],
      outlineWidth: 2,
      getColor: ({ 2: level = 0 }) => [255, 255, 255, getTagOpacity(level)],
      getSize: ({ 2: level = 0 }) => getTagSize(level),
      getText: ({ 0: text }) => text,
      getPosition: ({ 1: [x, y] }) => [x + cx, y + cy],
      updateTriggers: {
        visible: showZoneTag,
        getSize: zoom,
        getColor: zoom,
        outlineColor: zoom,
      },
      transitions: {
        getColor: 100,
      },
    }))
  }
}
