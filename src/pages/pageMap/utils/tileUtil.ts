import { merge } from 'lodash'
import { mapTiles } from '../configs'
import type { MapNameEnum, MapTileConfig } from '../configs'

export const getTileConfig = (name: MapNameEnum): MapTileConfig => {
  const baseConfig = mapTiles[name]
  if (!baseConfig.extend)
    return baseConfig
  return merge({}, getTileConfig(baseConfig.extend), baseConfig)
}

/** 优化配置存取，避免反复合并配置 */
export class TileUtil {
  static tileConfigRecord = new Map<MapNameEnum, MapTileConfig>()

  static getConfig = (name: MapNameEnum) => {
    if (this.tileConfigRecord.has(name))
      return this.tileConfigRecord.get(name) as MapTileConfig
    const config = getTileConfig(name)
    this.tileConfigRecord.set(name, config)
    return config
  }
}
