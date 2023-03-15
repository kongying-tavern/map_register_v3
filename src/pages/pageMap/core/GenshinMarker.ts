import L from 'leaflet'
import type { UnionMarkerVo } from '@/pages/pageMap/hooks'
import type { GenshinMap, GenshinMarkerRender } from '@/pages/pageMap/core'
import { getObjectFitSize, loadImage } from '@/utils'
import db from '@/database'

export interface GenshinMarkerOptions extends Omit<L.CircleMarkerOptions, 'renderer'> {
}

export type PointerState = 'default' | 'hover' | 'active'

const CIRCLE_ANGLE = Math.PI * 2

/** 地图点位 */
export class GenshinMarker extends L.CircleMarker {
  declare options: GenshinMarkerOptions
  declare _map: GenshinMap
  declare _renderer: GenshinMarkerRender
  declare _point: { x: number; y: number }
  declare _radius: number

  static undergroundImg?: HTMLImageElement
  static publicMission = loadImage('https://tiles.yuanshen.site/d/marker_image/underground.png')
    .then(img => this.undergroundImg = img)

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

  constructor(public marker: UnionMarkerVo, options?: GenshinMarkerOptions) {
    const { itemList = [], position = '0,0' } = marker
    const latlngExpression = position.split(',').map(Number) as [number, number]
    super(latlngExpression, { ...options, pane: 'markerPane' })

    this.#beforeDrawMission = (async () => {
      await GenshinMarker.publicMission
      this.items = (await db.item.bulkGet(itemList.map(item => item.itemId as number))).filter(Boolean) as API.ItemVo[]
      this.specialFlag = this.items.find(item => item.specialFlag === 1) !== undefined
      const icon = await db.icon.where('name').equals(this.items[0]?.iconTag ?? '').first()
      icon?.url && (this.markerIcon = await loadImage(icon.url))
    })()

    this.on('mouseover', () => {
      this.pointerState = 'hover'
      this.redraw()
    })
    this.on('mouseout', () => {
      this.pointerState = 'default'
      this.redraw()
    })
    this.on('mousedown', () => {
      this.pointerState = 'active'
      this.redraw()
    })
    this.on('mouseup', () => {
      this.pointerState = 'hover'
      this.redraw()
    })
    this.on('remove', this.blur)
  }

  _updatePath = async () => {
    await this.#beforeDrawMission
    this._renderer._ctx && this.drawSelf(this._renderer._ctx)
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
    this.redraw()
    GenshinMarker.activeIconMarker.remove()
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

  drawSelf = (ctx: CanvasRenderingContext2D) => {
    const { markerIcon, pointerState } = this
    if (!markerIcon)
      return

    const radius = this.getRadius()
    const boxSize = 2 * radius
    const { x, y } = this._point
    const { extraObject } = this.marker
    const { width: imgW, height: imgH } = markerIcon

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
    if (extraObject.underground?.is_underground && GenshinMarker.undergroundImg)
      ctx.drawImage(GenshinMarker.undergroundImg, x, y, radius + 2, radius + 2)
  }
}
