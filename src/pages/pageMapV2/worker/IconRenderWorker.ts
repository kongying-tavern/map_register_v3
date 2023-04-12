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

const BOX_SIZE = 40
const BORDER_SIZE = 4
const ICON_SIZE = 40 - 2 * BORDER_SIZE
const OUTER_RADIUS = BOX_SIZE / 2
const INNER_RADIUS = ICON_SIZE / 2

/** 将数据转换为 ImageBitmap */
const createBMP = async (res: Promise<Response>) => {
  const blob = await (await res).blob()
  const bmp = await createImageBitmap(blob)
  return bmp
}

/** 当底图无法被转换为 ImageBitmap 时使用替代图标 */
const withFallback = async (bmpMission: Promise<ImageBitmap>) => bmpMission
  .catch(() => createBMP(fetch(`${import.meta.env.VITE_ASSETS_BASE}/icons/-1.png`)))

const renderIcon = async (ev: MessageEvent<string>) => {
  try {
    const url = ev.data
    const type = typeof url

    const canvas = new OffscreenCanvas(BOX_SIZE, 1.2 * BOX_SIZE)
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('无法获取绘图上下文')

    if (type !== 'string')
      throw new Error(`无法处理的数据类型, typeof data is ${type}`)

    // 请求底图
    const img = await withFallback(createBMP(fetch(url)))

    // 绘制底图承托层
    const clipPath = new Path2D(`
      M ${OUTER_RADIUS} ${BOX_SIZE - BORDER_SIZE}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${OUTER_RADIUS} ${BORDER_SIZE}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 1 ${OUTER_RADIUS} ${BOX_SIZE - BORDER_SIZE}
      Z
    `)
    ctx.fillStyle = '#00000080'
    ctx.fill(clipPath)

    // 绘制 icon 底图（限制 icon 底图范围为 clipPath）
    ctx.save()
    ctx.clip(clipPath)
    const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', ICON_SIZE, ICON_SIZE, img.width, img.height)
    ctx.drawImage(img, sx, sy, sw, sh, dx + BORDER_SIZE, dy + BORDER_SIZE, dw, dh)
    ctx.restore()

    // 绘制边框结构
    const borderPath = new Path2D(`
      M ${OUTER_RADIUS} ${1.2 * BOX_SIZE}
      L ${0.12725 * BOX_SIZE} ${0.83325 * BOX_SIZE}
      A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 1 1 ${0.87275 * BOX_SIZE} ${0.83325 * BOX_SIZE}
      M ${OUTER_RADIUS} ${BOX_SIZE - BORDER_SIZE}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${OUTER_RADIUS} ${BORDER_SIZE}
      A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${OUTER_RADIUS} ${BOX_SIZE - BORDER_SIZE}
      Z
    `)
    ctx.fillStyle = '#FFF'
    ctx.fill(borderPath)

    // TODO 绘制地下图标

    const bmp = canvas.transferToImageBitmap()

    self.postMessage(bmp, { transfer: [bmp] })
  }
  catch (err) {
    self.postMessage(err instanceof Error ? err.message : `${err}`)
  }
}

self.addEventListener('message', renderIcon)
