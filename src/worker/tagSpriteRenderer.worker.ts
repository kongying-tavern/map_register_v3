import { getObjectFitSize } from '@/utils/getObjectFitSize'

const FALLBACK_IMAGE_URL = '/icons/unknown.webp'

/** 主线程输入数据 */
export interface WorkerInput {
  /** 需要被渲染的标签列表 */
  tagList: { tag: string; url: string }[]
  /** 图标尺寸 @default 64 */
  size?: number
  /** 并发请求限制 @default 1000 */
  maxRequests?: number
}

/** 主线程接收数据 */
export interface WorkerSuccessOutput {
  image: ArrayBuffer
  mapping: Record<string, [x: number, y: number]>
}

/** 主线程接收数据 */
export type WorkerOutput =
  | string // 错误原因
  | WorkerSuccessOutput

const calculateGrid = (length: number) => {
  const cols = Math.sqrt(length)
  const rows = Number.isInteger(cols) ? cols : Math.floor(cols) + 1
  return {
    cols: rows,
    rows,
  }
}

const loadImage = async (url: string, fallback?: ImageBitmap) => {
  const mission = fetch(url, { mode: 'cors' })
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob))
  return fallback ? mission.catch(() => fallback) : mission
}

const render = async (params: WorkerInput): Promise<WorkerSuccessOutput> => {
  const {
    tagList,
    size = 64,
    maxRequests = 1000,
  } = params

  if (!Number.isInteger(size) || size < 0)
    throw new Error('图标尺寸必须为大于 0 的整数。此外，出于渲染效果的考虑，不建议尺寸小于 32。')

  const { cols, rows } = calculateGrid(tagList.length)
  const canvasSize = cols * size
  const canvas = new OffscreenCanvas(canvasSize, canvasSize)
  const ctx = canvas.getContext('2d')!

  // 备用图片
  const fallbackImage = await loadImage(FALLBACK_IMAGE_URL)

  // 请求图片
  let tagImageCaches: ImageBitmap[] = []
  let requestQueue: Promise<ImageBitmap>[] = []
  for (let i = 0; i < tagList.length; i++) {
    const { url } = tagList[i]
    requestQueue.push(loadImage(url, fallbackImage))
    if (requestQueue.length >= maxRequests) {
      tagImageCaches = tagImageCaches.concat(await Promise.all(requestQueue))
      requestQueue = []
      continue
    }
  }
  if (requestQueue.length > 0)
    tagImageCaches = tagImageCaches.concat(await Promise.all(requestQueue))

  // 生成 mapping 并绘制
  const mapping: Record<string, [number, number]> = {}
  ;(() => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col
        const { tag } = tagList[index] ?? {}
        const img = tagImageCaches[index]
        if (!tag || !img)
          return
        const x = col * size
        const y = row * size
        mapping[tag] = [x, y]
        const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', size, size, img.width, img.height)
        ctx.drawImage(img, sx, sy, sw, sh, x + dx, y + dy, dw, dh)
      }
    }
  })()

  const image = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer()
  return { image, mapping }
}

self.onmessage = async (ev: MessageEvent<WorkerInput>) => {
  try {
    const result = await render(ev.data)
    self.postMessage(result, [result.image])
  }
  catch (err) {
    self.postMessage(err instanceof Error ? err.message : `${err}`)
  }
}
