import L from 'leaflet'
import type { MapNameEnum } from '@/pages/pageMap/configs'
import type { GenshinTileLayer } from '@/pages/pageMap/core'
import { TileUtil } from '@/pages/pageMap/utils'

/** 自定义点位渲染器 */
export class GenshinMarkerRender extends L.Canvas {
  declare _ctx?: CanvasRenderingContext2D
  constructor(options: L.RendererOptions = {}) {
    super(options)
  }
}
const renderer = new GenshinMarkerRender()

export class GenshinMap extends L.Map {
  constructor(ele: HTMLElement, options?: L.MapOptions) {
    super(ele, {
      ...options,
      renderer,
    })
    return this
  }

  ready = new Promise<GenshinMap>((resolve) => {
    this.whenReady(() => resolve(this))
  })

  configBaseLayer = (layer: GenshinTileLayer) => {
    const tileInfo = TileUtil.getTileInfo(layer.name as MapNameEnum)
    this.setCRS(tileInfo.crs)
    this.setMaxBounds(tileInfo.bounds)
    this.setView(tileInfo.center)
    this.flyTo(tileInfo.settings.center ?? [0, 0], tileInfo.settings.zoom ?? 0, {
      duration: 0.1,
    })
  }

  // FIXME 临时修复移除 L.ImageOverlay 时事件监听器没有同时移除的 bug
  removeLayer(layer: L.Layer): this {
    super.removeLayer(layer)
    const events = Reflect.get(this, '_events') as Record<string, { ctx?: L.Layer; fn: Function }[]>
    for (const key in events) {
      events[key].forEach(({ ctx }, index) => {
        if (!ctx)
          return
        const ctxId = Reflect.get(ctx, '_leaflet_id') as number
        const layerId = Reflect.get(layer, '_leaflet_id') as number
        if (ctxId !== layerId)
          return
        events[key].splice(index, 1)
      })
    }
    return this
  }

  setCRS = (crs: L.CRS) => {
    this.options.crs = crs
  }
}
