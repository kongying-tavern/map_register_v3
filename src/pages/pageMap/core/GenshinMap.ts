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

export interface GenshinMapHandleState {
  draggingMarker: boolean
}

export class GenshinMap extends L.Map {
  declare _layers: Record<string, L.Layer>
  declare _events: Record<string, { ctx?: L.Layer; fn: Function }[]>

  constructor(ele: HTMLElement, options?: L.MapOptions) {
    super(ele, {
      ...options,
      renderer,
    })

    // 通过事件代理来实现点位 focus 逻辑来让 map 存储 focus 的点位，
    // 以便其他功能的实现
    this.on('click', () => {
      if (this.handleState.draggingMarker)
        return
      this.pointedMarker
        ? this.pointedMarker.focus()
        : this.focusedMarker?.blur()
    })
  }

  /** 地图共用的 popup */
  popups = {
    markerPopup: L.popup({
      closeButton: false,
      minWidth: 223,
      maxWidth: 223,
      offset: [0, 0],
    }),
    draggingPopup: L.popup({
      pane: 'popupPane',
      closeOnClick: false,
      closeButton: false,
      closeOnEscapeKey: false,
    }).on('add', () => this.setHandleState('draggingMarker', true))
      .on('remove', () => this.setHandleState('draggingMarker', false)),
  }

  /** 地图是否准备好 */
  ready = new Promise<GenshinMap>((resolve) => {
    this.whenReady(() => resolve(this))
  })

  /** 地图是否有聚焦点位 */
  focusedMarker: GenshinMarker | null = null

  /** 地图是否有指针指向的点位 */
  pointedMarker: GenshinMarker | null = null

  /** 地图是否处于某种处理状态 */
  handleState = reactive<GenshinMapHandleState>({
    // 当地图处于点位拖拽状态时，需要拦截大部分操作以避免 bug
    draggingMarker: false,
  })

  setHandleState = <T extends keyof GenshinMapHandleState>(type: T, value: GenshinMapHandleState[T]) => {
    this.handleState[type] = value
  }

  pointToMarker = (marker: GenshinMarker | null = null): this => {
    this.pointedMarker = marker
    return this
  }

  updateMarkers = () => {
    this.fire('updateMarkers')
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
  removeLayer = (layer: L.Layer): this => {
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

  flyTo = (...args: Parameters<L.Map['flyTo']>): this => this.handleState.draggingMarker
    ? this
    : super.flyTo(...args)
}
