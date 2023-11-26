import { getObjectFitSize } from '@/utils/getObjectFitSize'

declare const globalThis: DedicatedWorkerGlobalScope

const FALLBACK_IMAGE_URL = '/icons/unknown.webp'

/** 主线程输入数据 */
export interface WorkerInput {
  /** 需要被渲染的标签列表 */
  tagList: { tag: string; url: string }[]
  /** 图标尺寸 @default 64 */
  size?: number
  /** 图标之间的空隙，用于避免精度误差导致的重叠 */
  gap?: number
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

const loadImage = async (url: string) => {
  return fetch(url, { mode: 'cors' })
    .then(res => res.blob())
    .then(blob => createImageBitmap(blob))
}

interface LimitPromiseAllOptions<T> {
  maxRequests?: number
  initResult?: T[]
}

const limitPromiseAll = async <D, T>(
  data: D[],
  toPromise: (item: D, index: number) => Promise<T | null>,
  {
    maxRequests = 10,
    initResult = [],
  }: LimitPromiseAllOptions<T> = {},
) => {
  let requestQueue: Promise<T | null>[] = []

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    requestQueue.push(toPromise(item, i))
    if (requestQueue.length >= maxRequests) {
      initResult = initResult.concat((await Promise.all(requestQueue)).filter(Boolean) as T[])
      requestQueue = []
      continue
    }
  }
  if (requestQueue.length > 0)
    initResult = initResult.concat((await Promise.all(requestQueue)).filter(Boolean) as T[])

  return initResult
}

const render = async (params: WorkerInput): Promise<WorkerSuccessOutput> => {
  const {
    tagList,
    size = 64,
    gap = 2,
    maxRequests = 1000,
  } = params

  if (!Number.isInteger(size) || size < 0)
    throw new Error('图标尺寸必须为大于 0 的整数。此外，出于渲染效果的考虑，不建议尺寸小于 32。')

  // 备用图片
  const fallbackImage = await loadImage(FALLBACK_IMAGE_URL)

  // ==================== url 去重 ====================

  const urlTagsMap = new Map<string, string[]>()
  tagList.forEach(({ tag, url }) => {
    const tags = urlTagsMap.get(url)
    if (!tags)
      urlTagsMap.set(url, [tag])
    else
      urlTagsMap.set(url, [...tags, tag])
  })

  const fetchList: { tags: string[]; url: string }[] = []
  urlTagsMap.forEach((tags, url) => {
    fetchList.push({ tags, url })
  })

  // ==================== 图片请求 ====================

  interface RenderObject {
    tags: string[]
    image: ImageBitmap
  }

  const fallbackRenderObject: RenderObject = {
    tags: [],
    image: fallbackImage,
  }

  const renderList = await limitPromiseAll(fetchList, async ({ tags, url }) => {
    try {
      const image = await loadImage(url)
      return {
        image,
        tags,
      } as RenderObject
    }
    catch {
      // 对于请求失败的 tags 使用 fallback 图片所在的位置
      fallbackRenderObject.tags.push(...tags)
      return null
    }
  }, {
    maxRequests,
    initResult: [fallbackRenderObject],
  })

  // ==================== 绘制矩阵 ====================

  const { cols, rows } = calculateGrid(renderList.length)
  const canvasSize = cols * size + (cols - 1) * gap
  const canvas = new OffscreenCanvas(canvasSize, canvasSize)
  const ctx = canvas.getContext('2d')!

  // 生成 mapping 并绘制
  const mapping: Record<string, [number, number]> = {}
  renderList.forEach(({ tags, image }, index) => {
    const row = Math.floor(index / rows)
    const col = index - row * cols
    const x = col * (size + gap)
    const y = row * (size + gap)
    const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', size, size, image.width, image.height)
    ctx.drawImage(image, sx, sy, sw, sh, x + dx, y + dy, dw, dh)
    tags.forEach((tag) => {
      mapping[tag] = [x, y]
    })
  })

  const image = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer()
  return { image, mapping }
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  try {
    const result = await render(ev.data)
    globalThis.postMessage(result, [result.image])
  }
  catch (err) {
    globalThis.postMessage(err instanceof Error ? err.message : `${err}`)
  }
})
