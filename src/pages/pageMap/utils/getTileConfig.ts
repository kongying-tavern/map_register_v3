import { merge } from 'lodash'
import { mapTiles } from '../configs'
import type { MapNameEnum, MapTileConfig } from '../configs'

export const getTileConfig = (name: MapNameEnum): MapTileConfig => {
  const baseConfig = mapTiles[name]
  console.log(`[${name}]`, baseConfig)
  if (!baseConfig.extend)
    return baseConfig
  return merge({}, getTileConfig(baseConfig.extend), baseConfig)
}
