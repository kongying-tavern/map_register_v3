import type { TileLayerOptions } from 'leaflet'
import L from 'leaflet'
import type { MapNameEnum, MapTileConfig } from '../configs'
import { getTileConfig } from '.'

const TILES_URL_PREFIX = 'https://assets.yuanshen.site/tiles_'
const DEFAULT_TILE_OPTIONS: TileLayerOptions = {
  maxZoom: 10,
  minZoom: -6,
  maxNativeZoom: 0,
  minNativeZoom: -3,
}

export class GenshinTileLayer extends L.TileLayer {
  constructor(name: MapNameEnum, options?: TileLayerOptions) {
    super('', options)
    this.tileConfig = getTileConfig(name)
  }

  /**
   * 如果此项为 `true`，在平移后不可见的切片被放入一个队列中，
   * 在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。
   * 这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
   */
  reuseTiles = true
  /** 切片原始配置 */
  readonly tileConfig: MapTileConfig

  static instanceRecord = new Map<MapNameEnum, GenshinTileLayer>()

  getTileUrl(coords: L.Coords): string {
    const { code, extension = 'png' } = this.tileConfig
    const { x, y } = coords
    const z = coords.z + 13
    return `${TILES_URL_PREFIX}${code}/${z}/${x}_${y}.${extension}`
  }

  static getLayer = (name: MapNameEnum) => {
    if (this.instanceRecord.has(name))
      return this.instanceRecord.get(name) as GenshinTileLayer

    const config = getTileConfig(name)
    const { code, extension, center = [3568, 6286], tilesOffset = [0, 0], size = [12288, 15360] } = config
    if (!code)
      throw new Error('unknown map code')
    if (!extension)
      throw new Error('unknown map extension')

    const [centerX, centerY] = center
    const [offsetX, offsetY] = tilesOffset
    const [width, height] = size

    const options: TileLayerOptions = {
      ...DEFAULT_TILE_OPTIONS,
      bounds: L.latLngBounds(
        L.latLng(-centerX + offsetX, -centerY + offsetY),
        L.latLng(width - centerX + offsetX, height - centerY + offsetY),
      ),
    }

    const layer = new GenshinTileLayer(name, options)
    this.instanceRecord.set(name, layer)
    return layer
  }
}
