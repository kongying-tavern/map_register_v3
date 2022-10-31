import L from 'leaflet'
import type { MapNameEnum } from '../configs'
import { mapTiles } from '../configs'
import { GenshinLayerController, GenshinTileLayer, TileUtil } from '.'

export class GenshinMap extends L.Map {
  constructor(ele: HTMLElement, options?: L.MapOptions) {
    const layers = Object.entries(mapTiles).reduce((seed, [name, config]) => {
      if (config.code) {
        const layer = GenshinTileLayer.getLayer(name as MapNameEnum)
        seed.push([name, layer])
      }
      return seed
    }, [] as [string, GenshinTileLayer][])

    super(ele, {
      ...options,
      layers: [],
    })

    const layerController = L
      .control
      .layers(Object.fromEntries(layers), {}, {
        position: 'bottomright',
      })
      .addTo(this)

    this.on('baselayerchange', (ev) => {
      const tileInfo = TileUtil.getTileInfo(ev.name as MapNameEnum)
      this.setCRS(tileInfo.crs)
      this.setMaxBounds(tileInfo.bounds)
      this.setView(tileInfo.center)
      this.flyTo(tileInfo.settings.center ?? [0, 0], tileInfo.settings.zoom ?? 0, {
        duration: 0.1,
      })
    })

    const controllerElement = layerController.getContainer() as HTMLElement
    const controller = new GenshinLayerController(controllerElement)
    this.layerController = controller

    return this
  }

  readonly layerController: GenshinLayerController

  init = () => {
    console.log('init')
    this.eachLayer((layer) => {
      console.log(layer)
    })
    // L.Map 没有切换地图的 API，这里 hack 一下，通过点击 DOM 的方式触发内部事件
    this.layerController.switchBaseLayer(this.layerController.baseLayersOptions[0].label)
  }

  setCRS = (crs: L.CRS) => {
    this.options.crs = crs
  }
}
