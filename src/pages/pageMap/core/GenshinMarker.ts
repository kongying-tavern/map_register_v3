import L from 'leaflet'
import type { ComputedRef } from 'vue'
import type { UnionMarkerVo } from '@/pages/pageMap/hooks'
import type { GenshinMap, GenshinRenderer } from '@/pages/pageMap/core'
import { getObjectFitSize, loadImage } from '@/utils'
import { localSettings, useArchiveStore } from '@/stores'
import db from '@/database'

export interface GenshinMarkerOptions extends Omit<L.CircleMarkerOptions, 'renderer'> {
}

export type PointerState = 'default' | 'hover' | 'active'

const CIRCLE_ANGLE = Math.PI * 2

/** 地图点位 */
export class GenshinMarker extends L.CircleMarker {
  declare options: GenshinMarkerOptions
  declare _map: GenshinMap
  declare _renderer: GenshinRenderer
  declare _point: { x: number; y: number }
  declare _radius: number
  declare _empty: () => boolean

  static readonly shape = {
    underground: (w: number, h: number, x: number, y: number) => new Path2D(`
      M ${0.5 * w + x} ${y}
      A ${0.5 * w} ${0.5 * h} 0 0 1 ${0.5 * w + x} ${h + y}
      A ${0.5 * w} ${0.5 * h} 0 0 1 ${0.5 * w + x} ${y}
      M ${0.5 * w + x} ${0.21 * h + y}
      L ${0.17 * w + x} ${0.4 * h + y}
      L ${0.5 * w + x} ${0.59 * h + y}
      L ${0.83 * w + x} ${0.4 * h + y}
      M ${0.5 * w + x} ${0.65 * h + y}
      L ${0.2916 * w + x} ${0.53 * h + y}
      L ${0.1716 * w + x} ${0.6009 * h + y}
      L ${0.5 * w + x} ${0.79 * h + y}
      L ${0.83 * w + x} ${0.6 * h + y}
      L ${0.7084 * w + x} ${0.53 * h + y}
      Z
    `),
  }

  /** 点位被聚焦时的光标 */
  static activeIconMarker = L.marker([0, 0], {
    interactive: false,
    pane: 'markerPane',
    zIndexOffset: 500,
    icon: L.divIcon({
      iconSize: [70, 70],
      // 样式见 src/style/leaflet/index.scss
      className: 'genshin-active-marker',
    }),
  })

  /** 绘制前需要被执行的异步任务 */
  #beforeDrawMission: Promise<void>

  /** 存储物品列表用于绘图 */
  items: API.ItemVo[] = []
  /** 用于识别是否为特殊点位 */
  specialFlag = false
  /** 点位主图标 */
  markerIcon?: HTMLImageElement
  /** 点位的指针状态 */
  pointerState: PointerState = 'default'
  /** 点位处于激活状态 */
  get focused() {
    return this._map?.focusedMarker === this
  }

  archiveStore: ReturnType<typeof useArchiveStore>
  isArchived: ComputedRef<boolean>

  constructor(public marker: UnionMarkerVo, options?: GenshinMarkerOptions) {
    const { itemList = [], position = '0,0' } = marker
    const latlngExpression = position.split(',').map(Number) as [number, number]
    super(latlngExpression, { ...options, pane: 'markerPane' })

    this.archiveStore = useArchiveStore()
    this.isArchived = computed(() => this.archiveStore.currentArchive.body.Data_KYJG.has(this.marker.id as number))

    this.#beforeDrawMission = (async () => {
      this.items = (await db.item.bulkGet(itemList.map(item => item.itemId as number))).filter(Boolean) as API.ItemVo[]
      this.specialFlag = this.items.find(item => item.specialFlag === 1) !== undefined
      const icon = await db.icon.where('name').equals(this.items[0]?.iconTag ?? '').first()
      icon?.url && (this.markerIcon = await loadImage(icon.url))
    })()

    this.on('mouseover', () => {
      this._map && this._map.pointToMarker(this)
      if (localSettings.value.markerHoverFeedback) {
        this.pointerState = 'hover'
        this.redraw()
      }
    })
    this.on('mouseout', () => {
      this._map && this._map.pointToMarker()
      if (localSettings.value.markerHoverFeedback) {
        this.pointerState = 'default'
        this.redraw()
      }
    })
    this.on('mousedown', (ev) => {
      if (ev.originalEvent.button !== 0)
        return
      const startState = this.pointerState
      this.pointerState = 'active'
      this.redraw()
      this.once('mouseup', () => {
        this.pointerState = startState
        this.redraw()
      })
    })
    this.on('remove', this.blur)
  }

  _updatePath = async () => {
    await this.#beforeDrawMission
    if (!this._renderer._ctx || this._renderer._drawing || this._empty())
      return
    this.drawSelf(this._renderer._ctx)
  }

  focus = (): this => {
    if (!this._map || this._map.handleState.draggingMarker)
      return this
    this._map.focusedMarker?.blur()
    this._map.focusedMarker = this
    this.redraw()
    this.bringToFront()
    const latlng = this.getLatLng()
    GenshinMarker.activeIconMarker
      .remove()
      .setLatLng(latlng)
      .addTo(this._map)
    this.fire('focus', { latlng })
    return this
  }

  blur = (): this => {
    if (!this._map || this._map.handleState.draggingMarker)
      return this
    this._map.focusedMarker = null
    this._map.pointToMarker()
    this.redraw()
    GenshinMarker.activeIconMarker.remove()
    this.pointerState = 'default'
    this.fire('blur', { latlng: this.getLatLng() })
    return this
  }

  remove(): this {
    if (!this._map)
      return this
    this.blur()
    return super.remove()
  }

  getRadius = () => {
    return this._radius + (this.focused ? 4 : this.pointerState === 'active' ? -2 : 0)
  }

  redraw(): this {
    super.redraw()
    return this
  }

  drawSelf = (ctx: CanvasRenderingContext2D) => {
    const { markerIcon, pointerState } = this
    if (!markerIcon)
      return

    const radius = this.getRadius()
    const boxSize = 2 * radius
    const { x, y } = this._point
    const { extraObject } = this.marker
    const { width: imgW, height: imgH } = markerIcon

    ctx.globalAlpha = this.isArchived.value ? 0.4 : 1

    // 绘制背景
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, CIRCLE_ANGLE)
    ctx.fillStyle = this.focused ? 'rgb(70 70 70)' : 'rgb(50 57 71)'
    ctx.closePath()
    ctx.fill()

    // 绘制主图标
    const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', boxSize, boxSize, imgW, imgH)
    ctx.drawImage(markerIcon, sx, sy, sw, sh, x + dx - radius, y + dy - radius, dw, dh)

    // 绘制边框
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, CIRCLE_ANGLE)
    ctx.closePath()
    ctx.strokeStyle = this.focused
      ? 'rgb(58 205 82)'
      : ({
          default: '#D3BC8E',
          hover: 'skyblue',
          active: 'skyblue',
        })[pointerState]
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()

    // 绘制地下点位图标
    if (extraObject.underground?.is_underground) {
      const size = 1.1 * this.getRadius()
      const offset = size / 2
      ctx.beginPath()
      ctx.arc(x + offset, y + offset, offset, 0, CIRCLE_ANGLE)
      ctx.closePath()
      ctx.fillStyle = 'rgb(255 255 255)'
      ctx.fill()
      ctx.fillStyle = 'rgb(51 51 51)'
      ctx.fill(GenshinMarker.shape.underground(size, size, x, y))
    }
  }
}
