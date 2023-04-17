/**
 * @说明
 * 该线程用于对物品 icon 进行预渲染
 * @收到的数据类型
 * string | undefined
 * @发送的数据类型
 * 成功时为 ImageBitMap
 * 失败时为 string，表示错误的原因
 */
import { getObjectFitSize } from '@/utils/getObjectFitSize'
import { getPrototypeOf } from '@/utils/getPrototypeOf'
import {
  BACKGROUND_ACTIVE_COLOR,
  BACKGROUND_COLOR,
  BACKGROUND_FOCUS_COLOR,
  BACKGROUND_HOVER_COLOR,
  BORDER_COLOR,
  BORDER_WIDTH,
  ICON_HEIGHT,
  ICON_RECT,
  ICON_WIDTH,
  INNER_GAP,
} from '@/pages/pageMapV2/config/markerIcon'
import { FALLBACK_ITEM_ICON_URL } from '@/shared/constant'

const INNER_SIZE = ICON_WIDTH - 2 * INNER_GAP
const OUTER_RADIUS = ICON_WIDTH / 2
const INNER_RADIUS = INNER_SIZE / 2

/** 将数据转换为 ImageBitmap */
const createBMP = async (res: Promise<Response>) => {
  const blob = await (await res).blob()
  const bmp = await createImageBitmap(blob)
  return bmp
}

/** 当底图无法被转换为 ImageBitmap 时使用替代图标 */
const withFallback = async (bmpMission: Promise<ImageBitmap>) => bmpMission
  .catch(() => createBMP(fetch(FALLBACK_ITEM_ICON_URL)))

const renderIcon = async (ev: MessageEvent<Map<string, { url: string; index: number }>>) => {
  try {
    if (!(ev.data instanceof Map))
      throw new Error(`预期类型 (Map) 与实际类型 (${getPrototypeOf(ev.data)}) 不符`)

    // 请求底图
    const icons: Promise<ImageBitmap>[] = []
    ev.data.forEach(({ index, url }) => {
      icons[index] = withFallback(createBMP(fetch(url)))
    })
    const bmps = await Promise.all(icons)

    // 创建模式图层
    const patternCanvas = new OffscreenCanvas(ICON_RECT[0], ICON_RECT[1])
    const patternCtx = patternCanvas.getContext('2d')
    if (!patternCtx)
      throw new Error('无法获取模式图层绘图上下文')

    // 创建精灵图层
    // 宽度倍数 8 来自 IconManager 所设置的状态数
    // 详见 interface SpiritIconMap 的注释
    const canvas = new OffscreenCanvas(8 * ICON_RECT[0], ev.data.size * ICON_RECT[1])
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('无法获取精灵图层绘图上下文')

    // 图标背景路径
    const backgroundPath = new Path2D(`
      M ${OUTER_RADIUS} ${ICON_HEIGHT}
      L ${0.12725 * ICON_WIDTH} ${0.83325 * ICON_WIDTH}
      A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 1 1 ${0.87275 * ICON_WIDTH} ${0.83325 * ICON_WIDTH}
      M ${OUTER_RADIUS} ${ICON_WIDTH - INNER_GAP}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${OUTER_RADIUS} ${INNER_GAP}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${OUTER_RADIUS} ${ICON_WIDTH - INNER_GAP}
      Z
    `)

    // 底图承托层路径
    const clipPath = new Path2D(`
      M ${OUTER_RADIUS} ${ICON_WIDTH - INNER_GAP}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${OUTER_RADIUS} ${INNER_GAP}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${OUTER_RADIUS} ${ICON_WIDTH - INNER_GAP}
      Z
    `)

    // 通过偏移阴影来绘制外边框
    patternCtx.save()
    patternCtx.translate(-ICON_RECT[0], -ICON_RECT[1])
    const scaleRatio = (ICON_WIDTH + 2 * BORDER_WIDTH) / ICON_WIDTH
    patternCtx.scale(scaleRatio, scaleRatio)
    patternCtx.shadowColor = BORDER_COLOR
    patternCtx.shadowOffsetX = ICON_RECT[0]
    patternCtx.shadowOffsetY = ICON_RECT[1]
    patternCtx.fill(backgroundPath)
    patternCtx.restore()

    // 绘制底图承托层
    patternCtx.save()
    patternCtx.translate(BORDER_WIDTH, BORDER_WIDTH)
    patternCtx.fillStyle = BORDER_COLOR
    patternCtx.fill(clipPath)
    patternCtx.restore()

    const pattern1 = patternCtx.createPattern(patternCanvas, 'repeat')
    if (!pattern1)
      throw new Error('无法创建边框绘制模式')
    ctx.fillStyle = pattern1
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制图标背景
    patternCanvas.width = 4 * ICON_RECT[0]
    ;[
      BACKGROUND_COLOR,
      BACKGROUND_HOVER_COLOR,
      BACKGROUND_ACTIVE_COLOR,
      BACKGROUND_FOCUS_COLOR,
    ].forEach((bgColor, index) => {
      patternCtx.save()
      patternCtx.translate(index * ICON_RECT[0] + BORDER_WIDTH, BORDER_WIDTH)
      patternCtx.fillStyle = bgColor
      patternCtx.fill(backgroundPath)
      patternCtx.restore()
    })

    const pattern2 = patternCtx.createPattern(patternCanvas, 'repeat')
    if (!pattern2)
      throw new Error('无法创建背景绘制模式')
    ctx.fillStyle = pattern2
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制 icon 底图（限制 icon 底图范围为 clipPath）
    patternCanvas.width = ICON_RECT[0]
    patternCanvas.height = ev.data.size * ICON_RECT[1]
    bmps.forEach((img, index) => {
      patternCtx.save()
      patternCtx.translate(BORDER_WIDTH, index * ICON_RECT[1] + BORDER_WIDTH)
      patternCtx.clip(clipPath)
      const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', INNER_SIZE, INNER_SIZE, img.width, img.height)
      patternCtx.drawImage(img, sx, sy, sw, sh, dx + INNER_GAP, dy + INNER_GAP, dw, dh)
      patternCtx.restore()
    })

    const pattern3 = patternCtx.createPattern(patternCanvas, 'repeat-x')
    if (!pattern3)
      throw new Error('无法创建图标绘制模式')
    ctx.fillStyle = pattern3
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制地下图标
    patternCanvas.width = ICON_RECT[0]
    patternCanvas.height = ICON_RECT[1]
    patternCtx.translate(BORDER_WIDTH, BORDER_WIDTH)
    patternCtx.fillStyle = '#313131'
    patternCtx.fill(new Path2D(`
      M ${ICON_WIDTH} ${0.95 * ICON_WIDTH}
      A ${INNER_RADIUS / 2} ${INNER_RADIUS / 2} 0 0 1 ${0.55 * ICON_WIDTH} ${0.95 * ICON_WIDTH}
      A ${INNER_RADIUS / 2} ${INNER_RADIUS / 2} 0 0 1 ${ICON_WIDTH} ${0.95 * ICON_WIDTH}
      Z
    `))
    patternCtx.fillStyle = '#FFF'
    patternCtx.fill(new Path2D(`
    M ${0.775 * ICON_WIDTH} ${0.8 * ICON_WIDTH}
    L ${0.94375 * ICON_WIDTH} ${0.9125 * ICON_WIDTH}
    L ${0.775 * ICON_WIDTH} ${1.025 * ICON_WIDTH}
    L ${0.60625 * ICON_WIDTH} ${0.9125 * ICON_WIDTH}
    Z
    M ${0.775 * ICON_WIDTH} ${1.055 * ICON_WIDTH}
    L ${0.91 * ICON_WIDTH} ${0.965 * ICON_WIDTH}
    L ${0.94375 * ICON_WIDTH} ${0.9875 * ICON_WIDTH}
    L ${0.775 * ICON_WIDTH} ${1.1 * ICON_WIDTH}
    L ${0.60625 * ICON_WIDTH} ${0.9875 * ICON_WIDTH}
    L ${0.64 * ICON_WIDTH} ${0.965 * ICON_WIDTH}
    Z
  `))

    const pattern4 = patternCtx.createPattern(patternCanvas, 'repeat')
    if (!pattern4)
      throw new Error('无法创建地下图标绘制模式')
    ctx.fillStyle = pattern4
    ctx.fillRect(canvas.width / 2, 0, canvas.width, canvas.height)

    const bmp = canvas.transferToImageBitmap()
    self.postMessage(bmp, { transfer: [bmp] })
  }
  catch (err) {
    self.postMessage(err instanceof Error ? err.message : `${err}`)
  }
}

self.addEventListener('message', renderIcon)
