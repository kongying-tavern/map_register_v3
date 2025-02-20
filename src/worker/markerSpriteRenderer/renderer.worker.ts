import type { IconLayer } from 'deck.gl'
import type { Logger } from '@/utils/logger'
import { WorkerThreadDB } from '@/database/db/worker'
import { getDigest } from '@/utils/getDigest'
import { useLoggerWorker } from '@/hooks/useWorkerLogger'

const db = new WorkerThreadDB()

declare const globalThis: DedicatedWorkerGlobalScope

/** 主线程输入数据 */
export interface WorkerInput {
  /** 图标标签的精灵图 */
  tagSprite: ArrayBuffer

  /** 图标标签的坐标 mapping */
  tagsPositionList: DBType.CacheTypes['tagSprite']['tagsPositionList']

  /** 点位图标的交互状态列表，颜色会被渲染在图标的图标状态部分路径上 */
  states: StateOption[]

  /** 点位图标的无状态部分的颜色 */
  outlineColor?: string

  /** 图标尺寸，正方形 */
  iconSize?: number

  /** 绘制间隙空间，用于避免舍入精度导致的层叠问题（除非使用奇数尺寸，否则不需要给这个值） */
  gap?: number
}

interface StateOption {
  state: string
  color: string
}

interface AttachOption {
  /** 附加纹理的 key，用于获取纹理映射坐标 */
  key: string
  /** 附加纹理 */
  icon: ImageBitmap
  /** 附加纹理是否渲染于图标层级之下 */
  under?: boolean
}

/** 主线程接收数据 */
export type WorkerSuccessOutput = Omit<DBType.MarkerSprite, 'tagSpriteDigest'>

/** 主线程接收数据 */
export type WorkerOutput =
  | string // 错误原因
  | WorkerSuccessOutput

/** 获取画布的绘制结果 */
const createSnapshot = ([width, height]: [number, number], draw: (ctx: OffscreenCanvasRenderingContext2D) => void) => {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  return canvas.transferToImageBitmap()
}

/**
 * 纹理尺寸限制
 * @note 这个值在 chrome 以外的环境下可能是不同的！
 */
const DEFAULT_TEXTURE_LIMIT = 4096

/** 最大尺寸限制，以避免纹理本体过大影响解析 */
const MAX_TEXTURE_LIMIT = 8192

/** 内容区相比于图标大小的缩放比，根据 `BORDER_PATH` 的实际情况进行修改 */
const CONTENT_SCALE = 0.64375

/** 内容区的中心点，根据 `BORDER_PATH` 的实际情况进行修改 */
const CENTER = {
  X: 32,
  Y: 28.5892,
}

/** 图标定位钉子所在的位置 */
const ANCHOR = {
  X: 32,
  Y: 61.5228,
}

/** 图标无状态部分路径 */
const OUTLINE_PATH = new Path2D(`
M 32 64
L 25.6830 56.4717
A 28.5892 28.5892 0 1 1 38.3170 56.4717
Z
`)

/** 图标内容部分 */
const CONTENT_PATH_STR = `
A 20.5892 20.5892 0 1 0 32 8
A 20.5892 20.5892 0 1 0 32 49.1783
`

/** 图标内容部分路径 */
const CONTENT_PATH = new Path2D(`
M 32 49.1783
${CONTENT_PATH_STR}
`)

/** 图标状态部分路径 */
const BORDER_PATH = new Path2D(`
M ${ANCHOR.X} ${ANCHOR.Y}
L 26.1249 54.5211
A 26.5892 26.5892 0 1 1 37.8751 54.5211
L 32 61.5228
L 32 49.1783
${CONTENT_PATH_STR}
L 32 61.5228
Z
`)

/** 分层层级图标外圆 */
const UG_OUTER_PATH = new Path2D(`
M 48.6801 56.4692
A 11.2 11.2 0 1 0 48.6801 34.0692
A 11.2 11.2 0 1 0 48.6801 56.4692
Z
`)

/** 分层层级图标中间 */
const UG_INNER_PATH = new Path2D(`
M 48.6801 51.8967
L 56.6462 47.3630
L 54.5031 46.0701
L 48.6801 49.3842
L 42.8570 46.0701
L 40.7139 47.3630
Z
M 48.6801 47.7092
L 56.6462 43.1754
L 48.6801 38.6417
L 40.7139 43.1754
Z
`)

/** 分层层级图标预绘制 */
const UG_ICON = createSnapshot([64, 64], (ctx) => {
  ctx.clearRect(0, 0, 64, 64)
  ctx.fillStyle = '#333333'
  ctx.fill(UG_OUTER_PATH)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill(UG_INNER_PATH)
})

/**
 * 编排画板并生成 mapping，具体思路如下：
 * 1. 第一行预留给状态纹理+附加纹理，正常情况下够用了，
 */
const calculate = ({ tagsPositionList, states, attachs, iconSize, gap, textureSizeLimit }: {
  tagsPositionList: DBType.CacheTypes['tagSprite']['tagsPositionList']
  states: StateOption[]
  attachs: AttachOption[]
  iconSize: number
  gap: number
  textureSizeLimit: number
}) => {
  const size = iconSize + gap

  /** 最小列数以保证 状态纹理+附加纹理 的总数能被容纳 */
  const minCols = states.length + attachs.length

  const cols = Math.max(Math.ceil(Math.sqrt(tagsPositionList.length)), minCols)
  const rows = (cols - 1) * cols >= tagsPositionList.length ? cols : cols + 1

  const width = cols * size
  const height = rows * size

  if (width > textureSizeLimit || height > textureSizeLimit)
    throw new Error(`纹理尺寸超出 WebGL 绘图限制`)

  const mapping: Exclude<IconLayer['props']['iconMapping'], string> = {}

  let total = 0
  let tagCount = 0

  states.forEach(({ state }) => {
    mapping[state] = {
      x: total * size + gap,
      y: gap,
      width: iconSize,
      height: iconSize,
      anchorX: ANCHOR.X,
      anchorY: ANCHOR.Y,
    }
    total += 1
  })

  attachs.forEach(({ key }) => {
    mapping[key] = {
      x: total * size + gap,
      y: gap,
      width: iconSize,
      height: iconSize,
      anchorX: ANCHOR.X,
      anchorY: ANCHOR.Y,
    }
    total += 1
  })

  tagsPositionList.forEach(({ tags }, index) => tags.forEach((tag) => {
    const row = Math.floor(index / cols)
    const col = index - row * cols
    const startX = col * size
    const startY = (row + 1) * size
    mapping[tag] = {
      x: startX,
      y: startY,
      width: iconSize,
      height: iconSize,
      anchorX: ANCHOR.X,
      anchorY: ANCHOR.Y,
    }
    total += 1
    tagCount += 1
  }))

  return { cols, rows, canvasW: width, canvasH: height, mapping, total, tagCount }
}

/**
 * #### 注意
 * 1. 每个图标状态以 64x64 分辨率进行绘制，其中的所有元素不得超过此范围
 * 2. 该函数必须以性能为优先考虑
 */
const render = async (options: WorkerInput, logger: Logger): Promise<WorkerSuccessOutput> => {
  const {
    tagSprite,
    tagsPositionList,
    outlineColor = '#33333360',
    states,
    iconSize = 64,
    gap = 0,
  } = options

  const tagSpriteDigest = await getDigest(tagSprite, 'SHA-256')

  const attachs: AttachOption[] = [
    { key: 'underground', icon: UG_ICON },
  ]

  const gl = new OffscreenCanvas(0, 0).getContext('webgl2')!
  const textureSizeLimit = Math.min(MAX_TEXTURE_LIMIT, gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? DEFAULT_TEXTURE_LIMIT)

  // 计算画板尺寸
  const { cols, rows, canvasW, canvasH, mapping, total, tagCount } = calculate({
    tagsPositionList,
    states,
    attachs,
    iconSize,
    gap,
    textureSizeLimit,
  })

  /** 单个图标的实际占用尺寸 */
  const size = iconSize + gap

  // 如果存在缓存，则跳过绘制步骤，只生成 mapping
  const cache = await (async () => {
    const cacheInfo = await db.cache.get('markerSprite')
    if (!cacheInfo || cacheInfo.id !== 'markerSprite' || cacheInfo.value.tagSpriteDigest !== tagSpriteDigest)
      return

    const { width, height } = await createImageBitmap(new Blob([cacheInfo.value.image], { type: 'image/png' }))

    const message = (() => {
      if (width > textureSizeLimit || height > textureSizeLimit)
        return '缓存的纹理不符合限制要求'
      if (width !== canvasW || height !== canvasH)
        return '纹理尺寸不统一'
      if (Object.keys(cacheInfo.value.mapping).length !== total)
        return '状态总数不统一'
    })()

    if (message) {
      await db.cache.delete(cacheInfo.id)
      logger.warn(message)
      return
    }

    return cacheInfo.value
  })()

  if (cache) {
    logger.info('缓存有效，跳过预渲染')
    return cache
  }

  logger.info('编排画板', { w: canvasW, h: canvasH, cols, rows, textureSizeLimit })

  logger.info('正在绘制...')
  const startTime = Date.now()
  const canvas = new OffscreenCanvas(canvasW, canvasH)
  const ctx = canvas.getContext('2d')!

  // 留出绘制间隙空间，用于避免舍入精度导致的层叠问题（在奇数图标尺寸下出现）
  ctx.translate(gap, gap)

  // 绘制 outline
  ctx.fillStyle = ctx.createPattern(createSnapshot([size, size], (scopedCtx) => {
    scopedCtx.fillStyle = outlineColor
    scopedCtx.fill(OUTLINE_PATH)
  }), 'repeat')!
  ctx.fillRect(0, size, canvasW, canvasH - size)

  // 绘制 border
  states.forEach(({ color }, index) => {
    ctx.drawImage(createSnapshot([size, size], (scopedCtx) => {
      scopedCtx.fillStyle = color
      scopedCtx.fill(BORDER_PATH)
    }), index * size, 0)
  })

  // 绘制附加层
  attachs.forEach(({ icon }, index) => {
    ctx.drawImage(icon, (states.length + index) * size, 0)
  })

  // 绘制 content
  const spriteImage = await createImageBitmap(new Blob([tagSprite], { type: 'image/png' }))

  tagsPositionList.forEach(({ pos: [x, y] }, index) => {
    const row = Math.floor(index / cols)
    const col = index - row * cols
    const startX = col * size
    const startY = (row + 1) * size
    ctx.save()
    ctx.translate(startX, startY)
    // ctx.strokeStyle = 'red'
    // ctx.strokeRect(0, 0, size, size)
    ctx.clip(CONTENT_PATH)
    ctx.translate(CENTER.X, CENTER.Y)
    ctx.scale(CONTENT_SCALE, CONTENT_SCALE)
    ctx.drawImage(spriteImage, x, y, 64, 64, -32, -32, 64, 64)
    ctx.restore()
  })

  // 转换为图片
  const image = await (await canvas.convertToBlob()).arrayBuffer()
  logger.info('绘制结果', {
    cost: `${Date.now() - startTime} ms`,
    cols,
    rows,
    canvasW,
    canvasH,
    byteLength: image.byteLength,
    total,
    tagCount,
  })

  // 更新缓存
  const digest = await getDigest(image, 'SHA-256')
  await db.cache.put({
    id: 'markerSprite',
    value: {
      image,
      mapping,
      tagSpriteDigest,
    },
    digest,
  })

  return { image, mapping }
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  const { send, logger } = useLoggerWorker<WorkerInput, WorkerOutput>(ev, '点位渲染')

  try {
    const res = await render(ev.data, logger)
    send(res, [res.image])
  }
  catch (err) {
    logger.error(err instanceof Error ? err.message : `${err}`)
    send(err instanceof Error ? err.message : `${err}`)
  }
})
