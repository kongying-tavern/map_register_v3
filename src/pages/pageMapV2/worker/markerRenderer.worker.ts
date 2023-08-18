/**
 * @说明
 * 该线程用于对物品 icon 进行预渲染
 * @收到的数据类型
 * string | undefined
 * @发送的数据类型
 * 成功时为 ImageBitMap
 * 失败时为 string，表示错误的原因
 */
import { getPrototypeOf } from '@/utils/getPrototypeOf'
import { ICON, ICON_MAPPING_STATES } from '@/pages/pageMapV2/config/markerIcon'
import { getObjectFitSize } from '@/utils/getObjectFitSize'
import { FALLBACK_ITEM_ICON_URL } from '@/shared/constant'

const FALLBACK_ICON = fetch(FALLBACK_ITEM_ICON_URL).then(res => res.blob()).then(blob => createImageBitmap(blob))
const fetchAsBMP = async (url: string) => {
  try {
    const blob = await fetch(url).then(res => res.blob())
    const bmp = await createImageBitmap(blob)
    if (!bmp?.width || !bmp?.height)
      throw new Error(`请求图像 "${decodeURIComponent(url)}" 失败`)
    return bmp
  }
  catch {
    return FALLBACK_ICON
  }
}

const INNER_GAP = ICON.size.w / 2 - ICON.content.radius
const CONTENT_SIZE = ICON.content.radius * 2
const ANG2RAD = Math.PI / 180

/**
 * 注意！
 * 当前图标绘制方法是出于效率最大目的所特殊定制的，其中使用了基于 canvas 模式的多种批量绘制操作。
 * 这不是一个通用的绘制方法，需要根据图标的具体需求来更改。
 * @todo 后期可能需要引入 2d 渲染库来降低绘制代码编写复杂度
 */
const renderMarker = async (ev: MessageEvent<Map<string, { url: string; index: number }>>) => {
  try {
    if (!(ev.data instanceof Map))
      throw new Error(`预期类型 (Map) 与实际类型 (${getPrototypeOf(ev.data)}) 不符`)

    // 请求底图
    const icons: Promise<ImageBitmap>[] = []
    ev.data.forEach(({ index, url }) => (icons[index] = fetchAsBMP(url)))
    const bmps = await Promise.all(icons)

    // 请求定位图标
    const positionImgs = await Promise.all(ICON.positions.map(async ({ icon }) => {
      if (!icon)
        return null
      const bmp = await fetchAsBMP(icon.url)
      return {
        ...icon,
        bmp,
      }
    }))

    // 图标背景路径（一个大头固钉形状）
    const pathBackground = new Path2D()
    const radiusInner = (ICON.size.w - 2 * ICON.border.width) / 2
    pathBackground.arc(ICON.size.w / 2, ICON.size.w / 2, radiusInner, -259.6 * ANG2RAD, 79.6 * ANG2RAD)
    pathBackground.lineTo(ICON.affix.x, ICON.affix.y)
    pathBackground.closePath()

    // 图标内容路径（中间含有图片的部分）
    const pathIcon = new Path2D()
    const radiusOuter = ICON.size.w / 2
    pathIcon.arc(radiusOuter, radiusOuter, ICON.content.radius, 0, 360 * ANG2RAD)

    // 创建模式图层
    const patternCanvas = new OffscreenCanvas(ICON.size.w, ICON.size.h)
    const patternCtx = patternCanvas.getContext('2d')!
    const createPattern = (repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat') => patternCtx.createPattern(patternCanvas, repetition)!

    // 创建精灵图层
    const canvas = new OffscreenCanvas(ICON_MAPPING_STATES.length * ICON.size.w, ev.data.size * ICON.size.h)
    const ctx = canvas.getContext('2d')!

    /** 画板半宽度 */
    const HALF_WIDTH = canvas.width / 2

    // 0. debug
    if (ICON.debug) {
      patternCtx.rect(0, 0, ICON.size.w, ICON.size.h)
      patternCtx.closePath()
      patternCtx.lineWidth = 2
      patternCtx.strokeStyle = 'red'
      patternCtx.stroke()
    }

    // 1. 绘制底部阴影
    patternCtx.beginPath()
    patternCtx.ellipse(ICON.affix.x, ICON.affix.y, ICON.shadow.radiusX, ICON.shadow.radiusY, 0, 0, Math.PI * 2)
    patternCtx.fillStyle = ICON.shadow.color
    patternCtx.fill()
    ctx.fillStyle = createPattern('repeat')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. 绘制背景
    patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height)
    patternCtx.save()
    patternCtx.translate(-1.5 * ICON.border.width, -1.5 * ICON.border.width)
    const scaleRatio = 1 + 2 * (ICON.border.width * 2 / ICON.size.h)
    patternCtx.scale(scaleRatio, scaleRatio)
    patternCtx.fillStyle = ICON.border.color
    patternCtx.fill(pathBackground)
    patternCtx.restore()
    ctx.fillStyle = createPattern('repeat')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 3. 绘制边框
    patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height)
    const pathInnerBorder = new Path2D()
    pathInnerBorder.addPath(pathBackground)
    pathInnerBorder.addPath(pathIcon)
    patternCtx.save()
    patternCtx.clip(pathInnerBorder, 'evenodd')
    ICON.states.forEach(({ color }, index) => {
      patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height)
      patternCtx.fillStyle = color
      patternCtx.fill(pathBackground)
      ctx.fillStyle = createPattern('repeat')
      const offset = ICON.size.w * index
      ctx.fillRect(offset, 0, ICON.size.w, canvas.height)
      ctx.fillRect(HALF_WIDTH + offset, 0, ICON.size.w, canvas.height)
    })

    // 4. 绘制底图
    patternCanvas.height = ev.data.size * ICON.size.h
    bmps.forEach((img, index) => {
      patternCtx.save()
      patternCtx.translate(0, index * ICON.size.h)
      patternCtx.clip(pathIcon)
      const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', CONTENT_SIZE, CONTENT_SIZE, img.width, img.height)
      patternCtx.drawImage(img, sx, sy, sw, sh, dx + INNER_GAP, dy + INNER_GAP, dw, dh)
      patternCtx.restore()
    })
    ctx.fillStyle = createPattern('repeat-x')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 5. 绘制地下图标
    patternCanvas.height = ICON.size.h
    positionImgs.forEach((icon) => {
      if (!icon)
        return
      patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height)
      patternCtx.drawImage(icon.bmp, 0, 0, icon.bmp.width, icon.bmp.height, ...icon.pos, ...icon.size)
    })
    ctx.fillStyle = createPattern('repeat')
    ctx.fillRect(HALF_WIDTH, 0, canvas.width, canvas.height)

    const bmp = canvas.transferToImageBitmap()
    self.postMessage(bmp, { transfer: [bmp] })
  }
  catch (err) {
    self.postMessage(err instanceof Error ? err.message : `${err}`)
  }
}

self.addEventListener('message', renderMarker)
