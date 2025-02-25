import type { Logger } from '@/utils/logger'
import { WorkerThreadDB } from '@/database/db/worker'
import { useLoggerWorker } from '@/hooks/useWorkerLogger'
import { getDigest } from '@/utils/getDigest'
import { getObjectFitSize } from '@/utils/getObjectFitSize'
import { limitPromiseAll } from '@/utils/limitPromiseAll'

const db = new WorkerThreadDB()

declare const globalThis: DedicatedWorkerGlobalScope

export interface WorkerInput {
  /** 需要被渲染的标签列表 */
  tagList: { tag: string, url: string }[]
  /** 图标尺寸 @default 64 */
  size?: number
  /** 图标之间的空隙，用于避免精度误差导致的重叠 */
  gap?: number
  /** 并发请求限制 @default 1000 */
  maxRequests?: number
}

interface RenderObject {
  tags: string[]
  image: ImageBitmap
}

export type WorkerSuccessOutput = DBType.TagSprite

/** 主线程接收数据 */
export type WorkerOutput =
  | string // 错误原因
  | WorkerSuccessOutput

const FALLBACK_IMAGE_URL = '/icons/unknown.webp'

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

const render = async (params: WorkerInput, logger: Logger): Promise<WorkerSuccessOutput> => {
  const {
    tagList,
    size = 64,
    gap = 2,
    maxRequests = 1000,
  } = params

  if (!Number.isInteger(size) || size < 0)
    throw new Error('图标尺寸必须为大于 0 的整数。此外，出于渲染效果的考虑，不建议尺寸小于 32。')

  const digest = await getDigest(new TextEncoder().encode(JSON.stringify(tagList)).buffer, 'SHA-256')
  const cache = await db.cache.get('tagSprite')

  const validCache = (() => {
    if (!cache || cache.id !== 'tagSprite')
      return
    if (cache.digest !== digest)
      return
    return cache.value
  })()

  if (validCache) {
    logger.info('缓存有效，跳过渲染')
    return validCache
  }

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

  const fetchList: { tags: string[], url: string }[] = []
  urlTagsMap.forEach((tags, url) => {
    fetchList.push({ tags, url })
  })

  // ==================== 图片请求 ====================

  const fallbackRenderObject: RenderObject = {
    tags: [],
    image: fallbackImage,
  }

  logger.info('请求图片...')
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

  logger.info('检测重复图片...')

  // ==================== 绘制矩阵 ====================

  const { cols, rows } = calculateGrid(renderList.length)
  const canvasSize = cols * (size + gap) + gap
  const canvas = new OffscreenCanvas(canvasSize, canvasSize)
  const ctx = canvas.getContext('2d')!

  const tagsPositionList: WorkerSuccessOutput['tagsPositionList'] = []

  logger.info('正在绘制...')
  renderList.forEach(({ tags, image }, index) => {
    const row = Math.floor(index / rows)
    const col = index - row * cols
    const x = col * size + (col + 1) * gap
    const y = row * size + (row + 1) * gap
    const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', size, size, image.width, image.height)
    ctx.drawImage(image, sx, sy, sw, sh, x + dx, y + dy, dw, dh)
    tagsPositionList.push({
      tags,
      pos: [x, y],
    })
  })

  const image = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer()
  logger.info('绘制结果', { byteLength: image.byteLength })

  await db.cache.put({
    id: 'tagSprite',
    digest,
    value: {
      image,
      tagsPositionList,
    },
  })

  return { image, tagsPositionList }
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  const { send, logger } = useLoggerWorker<WorkerInput, WorkerOutput>(ev, '图标渲染')

  try {
    const res = await render(ev.data, logger)
    send(res, [res.image])
  }
  catch (err) {
    logger.error(err instanceof Error ? err.message : `${err}`)
    send(err instanceof Error ? err.message : `${err}`)
  }
})
