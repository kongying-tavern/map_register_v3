import type { LeafletEvent, TileLayerOptions } from 'leaflet'
import L from 'leaflet'
import type { MapNameEnum, MapTileConfig } from '../configs'
import type { GenshinMap } from '.'
import { GenshinTextMarker, TileUtil } from '.'

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
    this.name = name
    this.tileConfig = TileUtil.getConfig(name)
    this.tileConfig.tags?.forEach(({ html, latlng, zoomMax, zoomMin, fontSize = 20 }) => {
      this.tagLayer.addLayer(new GenshinTextMarker(latlng, { html, zoomMax, zoomMin, fontSize }))
    })
    this.on('remove', () => {
      this.hideTag()
    })
    this.on('add', () => {
      this.showTag()
    })
    this.on('zoom', (ev) => {
      const { zoom } = ev as LeafletEvent & { zoom: number }
      const fontSize = 20 * (2 ** (zoom + 3))
      this.tagLayer.getLayers().forEach(layer => layer.fire('zoom', { zoom, fontSize }))
    })
  }

  /** 图层名称 */
  name: string
  /** 标注图层 */
  tagLayer = L.layerGroup([])
  /** 标注图层是否已被添加到地图 */
  tagLayerVisible = false
  /**
   * 如果此项为 `true`，在平移后不可见的切片被放入一个队列中，
   * 在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。
   * 这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
   */
  reuseTiles = true
  /** 切片原始配置 */
  readonly tileConfig: MapTileConfig
  /** 切片缓存 */
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

    const config = TileUtil.getConfig(name)
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

  showTag = (): this => {
    if (this.tagLayerVisible)
      return this
    this._map.addLayer(this.tagLayer)
    this.tagLayerVisible = true
    return this
  }

  hideTag = (): this => {
    if (!this.tagLayerVisible)
      return this
    this._map.removeLayer(this.tagLayer)
    this.tagLayerVisible = false
    return this
  }

  /** @overwrite */
  addTo(map: GenshinMap | L.LayerGroup): this {
    super.addTo(map)
    return this
  }
}
