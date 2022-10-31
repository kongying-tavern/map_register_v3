import L from 'leaflet'
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

  static getTileInfo = (name: MapNameEnum) => {
    const config = this.getConfig(name)
    return this.getTileInfoWith(config)
  }

  static getTileInfoWith = (config: MapTileConfig) => {
    const { size = [0, 0], tilesOffset = [0, 0], center = [0, 0], settings = {} } = config
    const [x, y] = center
    const [w, h] = size
    const [offsetX, offsetY] = tilesOffset

    /** 获取坐标参考系（CRS），本地图使用 simple 类型 CRS，将经度和纬度直接映射到 x 和 y */
    const crs = L.Util.extend({}, L.CRS.Simple, {
      /** 用给定的系数表示变换对象 */
      transformation: new L.Transformation(1, 0, 1, 0),
      projection: {
        /** 将地理坐标投影为 CRS 所接受的单位坐标 */
        project(latlng: L.LatLng) {
          return new L.Point(latlng.lat + x, latlng.lng + y)
        },
        /** 给定 CRS 坐标，反向投影为地理坐标 */
        unproject(point: L.Point) {
          return new L.LatLng(point.x - x, point.y - y)
        },
      },
      /** 以像素坐标表示矩形区域 */
      bounds: L.bounds(L.point(0, 0), L.point(w, h)),
    })

    const bounds = L.latLngBounds(
      L.latLng(-x + offsetX - 10000, -y + offsetY - 10000),
      L.latLng(w - x + offsetX + 10000, h - y + offsetY + 10000),
    )

    return { crs, size, center, tilesOffset, bounds, settings }
  }
}
