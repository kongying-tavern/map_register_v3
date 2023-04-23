import type { TextLayerProps } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import type { TagOptions } from '../config'

export const getTagsPropsFrom = (target: GenshinBaseLayer): TextLayerProps<TagOptions>[] => {
  const { showTags } = target.context.deck.stateManager.state
  const { zoom } = target.context.deck.mainViewState
  const { center, coordinateOrigin, coordinateSystem, groupedTags } = target.rawProps

  return groupedTags.map((tags, level) => ({
    id: `${target.props.id}-tag-level${level}`,
    coordinateSystem,
    coordinateOrigin,
    visible: showTags && ({
      0: zoom > -1.5,
      1: zoom <= -1.5,
      2: zoom <= -4,
    })[level],
    data: tags,
    characterSet: 'auto',
    fontFamily: 'MHYG, Monaco, monospace',
    fontSettings: {
      buffer: 8,
    },
    getColor: [255, 255, 255, 255],
    getBorderColor: [0, 0, 0, 128],
    getBorderWidth: 4,
    sizeMaxPixels: 32,
    sizeScale: 2 ** (zoom + 2),
    getSize: ({ level = 0 }) => ({
      0: 16,
      1: 32,
      2: 48,
    })[level],
    getText: d => d.text,
    getPosition: ({ pos: [x, y] }) => [x + center[0], y + center[1], 0],
  }))
}
