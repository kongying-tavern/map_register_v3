import L from 'leaflet'
import type { Ref } from 'vue'
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
      this.currentLayer.value = ev.layer as GenshinTileLayer
    })

    const controllerElement = layerController.getContainer() as HTMLElement
    const controller = new GenshinLayerController(controllerElement)
    this.layerController = controller

    const firstMapName = controller.baseLayersOptions[0].label as MapNameEnum
    // 当窗口长宽比低于 1200/776 时，这里需要选择两次，否则地图可能渲染不正确
    // 我也不知道为什么，不信的话你可以注释掉其中一次，并将窗口调整为 1200*777 试试看
    this.switchMap(firstMapName)
    this.switchMap(firstMapName)

    return this
  }

  readonly layerController: GenshinLayerController

  currentLayer = ref(null) as Ref<GenshinTileLayer | null>

  switchMap = (name: MapNameEnum) => {
    this.currentLayer.value && this.removeLayer(this.currentLayer.value)
    const layer = GenshinTileLayer.getLayer(name)
    this.addLayer(layer)
  }

  setCRS = (crs: L.CRS) => {
    this.options.crs = crs
  }

  /** @overwrite */
  addLayer(layer: GenshinTileLayer): this {
    super.addLayer(layer)
    return this
  }
}
