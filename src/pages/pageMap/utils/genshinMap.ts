import L from 'leaflet'
import type { MapNameEnum } from '../configs'
import type { GenshinTileLayer } from '.'
import { TileUtil } from '.'

export class GenshinMap extends L.Map {
  constructor(ele: HTMLElement, options?: L.MapOptions) {
    super(ele, options)
    return this
  }

  addBaseLayer = (layer: GenshinTileLayer) => {
    const tileInfo = TileUtil.getTileInfo(layer.name as MapNameEnum)
    this.setCRS(tileInfo.crs)
    this.setMaxBounds(tileInfo.bounds)
    this.setView(tileInfo.center)
    this.flyTo(tileInfo.settings.center ?? [0, 0], tileInfo.settings.zoom ?? 0, {
      duration: 0.1,
    })
  }

  setCRS = (crs: L.CRS) => {
    this.options.crs = crs
  }
}
