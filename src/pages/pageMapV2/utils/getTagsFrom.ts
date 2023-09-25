import { TextLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import { MAP_FONTFAMILY } from '../shared'

/**
 * 地图标签图层
 * @todo 为文本添加描边问题暂时无法很好的解决
 */
export const getTagsFrom = (target: GenshinBaseLayer): TextLayer<Item<Item<typeof tile.visibleTagGroups>>>[] => {
  const { zoom } = target.context.deck.mainViewState
  const { tile, setting } = target.context.deck.store
  const { center, coordinateOrigin, coordinateSystem } = target.rawProps

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

  return tile.visibleTagGroups.map((tags, level) => new TextLayer({
    id: `${target.props.id}-tag-${level}`,
    coordinateSystem,
    coordinateOrigin,
    visible: setting.showTag,
    data: tags,
    characterSet: 'auto',
    fontFamily: `${MAP_FONTFAMILY}, Monaco, monospace`,
    fontSettings: {
      buffer: 8,
      sdf: true,
    },
    sizeMaxPixels: 32,
    sizeScale: 2 ** (zoom + 2),
    outlineColor: [102, 102, 102, getTagOpacity(level) * 0.2 * 255],
    outlineWidth: 2,
    getColor: ({ 2: level = 0 }) => [255, 255, 255, getTagOpacity(level)],
    getSize: ({ 2: level = 0 }) => getTagSize(level),
    getText: ({ 0: text }) => text,
    getPosition: ({ 1: [x, y] }) => [x + center[0], y + center[1]],
    updateTriggers: {
      visible: setting.showTag,
      getSize: target.context.deck.mainViewState.zoom,
      getColor: target.context.deck.mainViewState.zoom,
      outlineColor: target.context.deck.mainViewState.zoom,
    },
    transitions: {
      getColor: 100,
    },
  }))
}
