import type { TextLayerProps } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import type { TagOptions } from '../config'

export const getTagsPropsFrom = (
  target: GenshinBaseLayer,
): TextLayerProps<TagOptions>[] => target.rawProps.groupedTags.map((tags, level) => ({
  id: `${target.props.id}-tag-level${level}`,
  coordinateSystem: target.rawProps.coordinateSystem,
  coordinateOrigin: target.rawProps.coordinateOrigin,
  visible: target.context.deck.showTag && ({
    0: target.context.deck.mainViewState.zoom > -2,
    1: target.context.deck.mainViewState.zoom <= -2,
    2: target.context.deck.mainViewState.zoom <= -4,
  })[level],
  data: tags,
  characterSet: 'auto',
  fontFamily: 'MHYG, Monaco, monospace',
  fontWeight: 'bold',
  fontSettings: {
    buffer: 8,
  },
  getColor: [255, 255, 255, 255],
  getBorderColor: [0, 0, 0, 128],
  getBorderWidth: 2,
  sizeMaxPixels: 32,
  sizeScale: 2 ** (target.context.deck.mainViewState.zoom + 2),
  getSize: ({ level = 0 }) => ({
    0: 16,
    1: 24,
    2: 32,
  })[level],
  getText: d => d.text,
  getPosition: ({ pos: [x, y] }) => [x + target.rawProps.center[0], y + target.rawProps.center[1], 0],
}))
