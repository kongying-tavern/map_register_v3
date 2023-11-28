import { defineStore } from 'pinia'
import { defaultsDeep } from 'lodash'
import { useDadianStore, useMapStore, useUserInfoStore } from '@/stores'
import type { AreaTagTuple } from '@/configs'
import { AREA_ADDITIONAL_CONFIG_MAP } from '@/configs'

export interface TileInfo extends Required<Pick<API.TileConfig, | 'code'
| 'extension'
| 'tilesOffset'
| 'size'
| 'center'>> {}

type AreaTagConfigs = Required<(typeof AREA_ADDITIONAL_CONFIG_MAP)[string]>['tags']

/**
 * 与地区对应的 tile 配置，为什么没有设计为与 layer code 对应而是与地区 code 对应，见以下原因：
 * 1. 首先是为了匹配筛选器的操作逻辑，即选择地区自动切换地图
 * 2. 其次，有利于为地区附加对应的 tag 或边界等数据
 * 3. 对于打点工具来说，关注地区信息比关注 tile 信息本身的时候会更多
 */
export interface AreaTileConfig {
  /** 地区关联的 tile 的信息，使用对象是为了方便复用 */
  tile: TileInfo
  /** 导航到该地区时的默认视口状态 */
  initViewState: {
    target: API.Coordinate2D
    zoom: number
  }
  /** 地区标签 */
  tags: AreaTagConfigs
}

export const useTileStore = defineStore('map-tile', () => {
  const dadianStore = useDadianStore()
  const userInfoStore = useUserInfoStore()
  const mapStore = useMapStore()

  /** key 是用于构建 tiles url 的参数 */
  const mergedTileConfigs = computed((): Record<string, AreaTileConfig> => {
    const { tiles = {}, tilesNeigui = {} } = dadianStore._raw

    const mergedTiles = userInfoStore.isNeigui
      ? {
          ...tiles,
          ...tilesNeigui,
        }
      : tiles

    const areaTileConfigs: Record<string, AreaTileConfig> = {}

    for (const maybeAreaCode in mergedTiles) {
      // 只保留实际配置，继承用的配置忽略
      if (!/[A-Z]:[A-Z]+(:\s+)?/.test(maybeAreaCode))
        continue

      const tileConfig = mergedTiles[maybeAreaCode]
      if (tileConfig.extend)
        defaultsDeep(tileConfig, mergedTiles[tileConfig.extend])

      const {
        code = '',
        center = [0, 0],
        extension = 'png',
        settings = {},
        size = [0, 0],
        tilesOffset = [0, 0],
      } = tileConfig
      const {
        tags = [],
        target: rewriteTarget,
      } = AREA_ADDITIONAL_CONFIG_MAP[maybeAreaCode] ?? {}
      const {
        center: target = [0, 0],
        zoom = 0,
      } = settings

      areaTileConfigs[maybeAreaCode] = {
        tags,
        tile: {
          code,
          center,
          size,
          extension,
          tilesOffset,
        },
        initViewState: {
          target: rewriteTarget ?? target,
          zoom,
        },
      }
    }

    return areaTileConfigs
  })

  const visibleTagGroups = computed((): AreaTagTuple[][] => {
    const levelTagsMap: AreaTagTuple[][] = []
    const { value: tileConfigs } = mergedTileConfigs
    for (const areaCode in tileConfigs) {
      const { tags, tile } = tileConfigs[areaCode]
      if (tile.code !== mapStore.currentLayerCode)
        continue
      for (const tag of tags) {
        const { 2: level = 0 } = tag
        if (!levelTagsMap[level as number])
          levelTagsMap[level as number] = []
        levelTagsMap[level as number].push(tag)
      }
    }
    return levelTagsMap
  })

  return {
    mergedTileConfigs,
    visibleTagGroups,
  }
})
