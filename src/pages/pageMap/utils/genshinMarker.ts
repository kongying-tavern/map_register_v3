import { ElMessage } from 'element-plus'
import L from 'leaflet'
import { getObjectFitSize, loadImage, messageFrom } from '@/utils'
import type { AnyObject } from '@/shared'

export interface GenshinLayerOptions extends AnyObject {
  img: {
    el: HTMLImageElement
    offset: { x: number; y: number }
    rotate: number
    size: [number, number]
    url: string
    hover?: boolean
    active?: boolean
    finished?: boolean
    hiddenFlag?: number
    popperOpen?: boolean
    isUnderground?: boolean
    specialFlag?: boolean
  }
  undergroundImg: {
    el: HTMLImageElement
    offset: { x: number; y: number }
    rotate: number
    size: [number, number]
    url: string
  }
  prevLatlng: { lat: number; lng: number }
  radius: number
}

interface ImgOptions {
  el: HTMLImageElement
  offset: { x: number; y: number }
  rotate: number
  size: [number, number]
  url: string
  active?: boolean
  popperOpen?: boolean
}

const doDraw = (ctx?: CanvasRenderingContext2D, fn?: () => void) => {
  if (!ctx)
    return
  ctx.save()
  fn?.()
  ctx.restore()
}

const defaultImgOptions = {
  rotate: 0,
  size: [40, 40],
  offset: { x: 0, y: 0 },
}

/** 共享的地下图片元素 */
const undergroundImage = ref<HTMLImageElement | null>(null)
loadImage('https://tiles.yuanshen.site/d/marker_image/underground.png').then((img) => {
  undergroundImage.value = img
})
const undergroundImgOptions = {
  rotate: 0,
  size: [20, 20],
  offset: { x: 10, y: 10 },
}

const angleCrds = (map: L.Map, prevLatlng: L.LatLng, latlng: L.LatLng) => {
  if (!latlng || !prevLatlng)
    return 0
  const pxStart = map.project(prevLatlng)
  const pxEnd = map.project(latlng)
  return Math.atan2(pxStart.y - pxEnd.y, pxStart.x - pxEnd.x) / Math.PI * 180 - 90
}

const getMarkerShape = (layer: AnyObject & { options: GenshinLayerOptions }, img: ImgOptions) => {
  const { active, popperOpen, offset } = img

  // 根据状态调整视觉尺寸
  let [w, h] = img.size
  w *= active ? 0.9 : popperOpen ? 1.1 : 1
  h *= active ? 0.9 : popperOpen ? 1.1 : 1
  const offsetX = offset.x * (active ? 0.9 : popperOpen ? 1.1 : 1)
  const offsetY = offset.y * (active ? 0.9 : popperOpen ? 1.1 : 1)

  // 基本参数计算
  const [halfW, halfH] = [w / 2, h / 2]
  const p = layer._point.round() as { x: number; y: number }
  let [x, y] = [p.x + offsetX, p.y + offsetY]
  ;[x, y] = img.rotate ? [-halfW, -halfH] : [x - halfH, y - halfH]
  const center = [x + halfW, y + halfH] as [number, number]
  const radius = Math.max(w, h) / 2
  return { w, h, x, y, center, radius }
}

/**
 * 点位图标绘制逻辑
 * @plugin fork from leaflet-canvas-markers
 */
L.Canvas.include({
  _updateImg(layer: AnyObject & { options: GenshinLayerOptions }) {
    const { img, undergroundImg } = layer.options
    const { width: rW, height: rH } = img.el
    const { width: urW, height: urH } = undergroundImg.el
    const { hover, active, popperOpen } = img

    const { w, h, x, y, center, radius } = getMarkerShape(layer, img)

    const ctx = this._ctx as CanvasRenderingContext2D

    !img.specialFlag && doDraw(ctx, () => {
      ctx.beginPath()
      // 绘制图标阴影
      ctx.shadowBlur = 3
      ctx.shadowColor = 'rgb(50, 57, 71)'
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      // 绘制图标背景
      ctx.arc(...center, radius, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fillStyle = 'rgb(50, 57, 71)'
      ctx.fill()
    })

    // 绘制位图内容
    doDraw(ctx, () => {
      if (img.rotate) {
        ctx.translate(x, y)
        ctx.rotate(img.rotate * Math.PI / 180)
      }
      const { sx, sy, swidth, sheight, x: dx, y: dy, width, height } = getObjectFitSize('contain', w, h, rW, rH)
      ctx.drawImage(img.el, sx, sy, swidth, sheight, dx + x, dy + y, width, height)
    })

    // 绘制 hover | active 蒙层
    !img.specialFlag && hover && doDraw(ctx, () => {
      ctx.beginPath()
      ctx.arc(...center, radius, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.fillStyle = active ? 'rgb(0, 0, 0, 0.2)' : 'rgb(255, 255, 255, 0.2)'
      ctx.fill()
    })

    // 绘制边框
    !img.specialFlag && doDraw(ctx, () => {
      ctx.beginPath()
      ctx.arc(...center, radius, 0, 2 * Math.PI)
      ctx.closePath()
      ctx.lineWidth = 2
      ctx.strokeStyle = popperOpen ? 'rgb(58, 205, 82)' : '#D3BC8E'
      ctx.stroke()
    })

    // 地下点位标识绘制
    img.isUnderground && doDraw(ctx, () => {
      const { w: uw, h: uh, x: ux, y: uy } = getMarkerShape(layer, {
        ...undergroundImg,
        active,
        popperOpen,
      })
      if (img.rotate) {
        ctx.translate(x, y)
        ctx.rotate(img.rotate * Math.PI / 180)
      }
      const { sx, sy, swidth, sheight, x: dx, y: dy, width, height } = getObjectFitSize('contain', uw, uh, urW, urH)
      ctx.drawImage(undergroundImg.el, sx, sy, swidth, sheight, dx + ux, dy + uy, width, height)
    })
  },
})

// TODO ES5 类写法不便于调试，后续改成 ES6 class
const CanvasMarker = L.CircleMarker.extend({
  _updatePath() {
    if (!this.options.img || !this.options.img.url)
      return
    if (!this.options.undergroundImg.el) {
      this.options.undergroundImg = { ...undergroundImgOptions, ...this.options.undergroundImg }
      this.options.undergroundImg.el = undergroundImage.value
    }
    if (!this.options.img.el) {
      this.options.img = { ...defaultImgOptions, ...this.options.img }
      this.options.img.rotate += angleCrds(this._map, this.options.prevLatlng, this._latlng)
      const img = document.createElement('img')
      img.referrerPolicy = 'no-referrer'
      img.src = this.options.img.url
      img.crossOrigin = ''
      img.onload = () => {
        this.redraw()
      }
      img.onerror = () => {
        this.options.img = null
      }
      this.options.img.el = img
    }
    else {
      this._renderer._updateImg(this)
    }
  },
// TODO leaflet 类型不完善
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as new (...args: any[]) => L.CircleMarker

// TODO leaflet 类型不完善
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const canvasMarker = (...opt: any[]) => {
  try {
    const i = opt.findIndex(o => typeof o === 'object' && o.img)
    if (i + 1) {
      if (!opt[i].radius && opt[i].img && opt[i].img.size)
        opt[i].radius = Math.ceil(Math.max(...opt[i].img.size) / 2)
      if (opt[i].pane)
        delete opt[i].pane
    }
  }
  catch (err) {
    ElMessage.error(`无法渲染点位: ${messageFrom(err)}`)
  }
  return new CanvasMarker(...opt)
}
