import { TextLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import type { TagOptions } from '../config'
import { MAP_FONTFAMILY } from '../shared'

export const getTagsFrom = (target: GenshinBaseLayer): TextLayer<TagOptions>[] => {
  const { zoom } = target.context.deck.mainViewState
  const { center, coordinateOrigin, coordinateSystem, groupedTags } = target.rawProps

  return groupedTags.map((tags, level) => new TextLayer({
    id: `${target.props.id}-tag-level${level}`,
    coordinateSystem,
    coordinateOrigin,
    visible: target.state.showTag && ({
      0: zoom > -1.5,
      1: zoom <= -1.5,
      2: zoom <= -4,
    })[level],
    data: tags,
    characterSet: 'auto',
    fontFamily: `${MAP_FONTFAMILY}, Monaco, monospace`,
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
    updateTriggers: {
      visible: [
        target.state.showTag,
        target.context.deck.mainViewState.zoom,
      ],
    },
  }))
}
