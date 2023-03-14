import L from 'leaflet'
import type { MapNameEnum } from '@/pages/pageMap/configs'
import type { GenshinMarker, GenshinTileLayer } from '@/pages/pageMap/core'

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
  declare _layers: Record<string, L.Layer>
  declare _events: Record<string, { ctx?: L.Layer; fn: Function }[]>

  ready = new Promise<GenshinMap>((resolve) => {
    this.whenReady(() => resolve(this))
  })

  focusedMarker: GenshinMarker | null = null
  pointedMarker: GenshinMarker | null = null

  constructor(ele: HTMLElement, options?: L.MapOptions) {
    super(ele, {
      ...options,
      renderer,
    })

    // 通过事件代理来实现点位 focus 逻辑来让 map 存储 focus 的点位，
    // 以便其他功能的实现
    this.on('click', () => this.pointedMarker
      ? this.pointedMarker.focus()
      : this.focusedMarker?.blur(),
    )
  }

  pointToMarker = (marker: GenshinMarker | null = null): this => {
    this.pointedMarker = marker
    return this
  }

  configBaseLayer = (layer: GenshinTileLayer): this => {
    const tileInfo = TileUtil.getTileInfo(layer.name as MapNameEnum)
    this.setCRS(tileInfo.crs)
    this.setMaxBounds(tileInfo.bounds)
    this.setView(tileInfo.center)
    this.flyTo(tileInfo.settings.center ?? [0, 0], tileInfo.settings.zoom ?? 0, {
      duration: 0.1,
    })
    return this
  }

  // FIXME 临时修复移除 L.ImageOverlay 时事件监听器没有同时移除的 bug
  removeLayer(layer: L.Layer): this {
    super.removeLayer(layer)
    const events = this._events
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

  setCRS = (crs: L.CRS): this => {
    this.options.crs = crs
    return this
  }
}
