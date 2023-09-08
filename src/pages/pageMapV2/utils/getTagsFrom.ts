import { TextLayer } from '@deck.gl/layers/typed'
import type { GenshinBaseLayer } from '../core'
import type { TagOptions } from '../config'
import { MAP_FONTFAMILY } from '../shared'
import { useMapSettingStore } from '@/stores'

export const getTagsFrom = (target: GenshinBaseLayer): TextLayer<TagOptions>[] => {
  const { zoom } = target.context.deck.mainViewState
  const { center, coordinateOrigin, coordinateSystem, groupedTags } = target.rawProps
  const mapSettingStore = useMapSettingStore()

  const getTagOpacity = (level: number) => ({
    0: zoom > -1.5,
    1: zoom <= -1.5,
    2: zoom <= -4,
  })[level]
    ? 1
    : 0

  const getTagSize = (level: number) => ({
    0: 16,
    1: 32,
    2: 48,
  })[level] ?? 16

  return groupedTags.map((tags, level) => new TextLayer({
    id: `${target.props.id}-tag-level${level}`,
    coordinateSystem,
    coordinateOrigin,
    visible: mapSettingStore.showTag,
    data: tags,
    characterSet: 'auto',
    fontFamily: `${MAP_FONTFAMILY}, Monaco, monospace`,
    fontSettings: {
      buffer: 8,
      sdf: true,
    },
    getColor: [255, 255, 255, getTagOpacity(level) * 255],
    outlineWidth: 2,
    outlineColor: [0, 0, 0, getTagOpacity(level) * 0.2 * 255],
    sizeMaxPixels: 32,
    sizeScale: 2 ** (zoom + 2),
    getSize: ({ level = 0 }) => getTagSize(level),
    getText: d => d.text,
    getPosition: ({ pos: [x, y] }) => [x + center[0], y + center[1]],
    updateTriggers: {
      visible: mapSettingStore.showTag,
      getColor: target.context.deck.mainViewState.zoom,
      outlineColor: target.context.deck.mainViewState.zoom,
    },
    transitions: {
      getColor: 150,
    },
  }))
}
