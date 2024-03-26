import type { IconMapping } from '@deck.gl/layers/typed/icon-layer/icon-manager'
import { Logger } from '@/utils/logger'
import { AppDatabase } from '@/database'
import { getDigest } from '@/utils/getDigest'

const db = new AppDatabase()

declare const globalThis: DedicatedWorkerGlobalScope

/** 主线程输入数据 */
export interface WorkerInput {
  /** 图标标签的精灵图 */
  tagSprite: ArrayBuffer

  /** 图标精灵图的哈希值 */
  tagSpriteDigest: string

  /** 图标标签的坐标 mapping */
  tagsPositionList: DBType.CacheTypes['tagSprite']['tagsPositionList']

  /** 点位图标的交互状态列表，颜色会被渲染在图标的图标状态部分路径上 */
  states: { state: string; color: string }[]

  /** 点位图标的无状态部分的颜色 */
  outlineColor?: string

  /** 图标尺寸，正方形 */
  iconSize?: number

  /** 绘制间隙空间，用于避免舍入精度导致的层叠问题（除非使用奇数尺寸，否则不需要给这个值） */
  gap?: number
}

interface MppingOptions extends WorkerInput {
  types: { type: string; icon?: ImageBitmap }[]
  rows: number
  singleSize: number
  stateCount: number
  unitW: number
  unitH: number
}

/** 主线程接收数据 */
export type WorkerSuccessOutput = DBType.MarkerSprite

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
 * 图片最大尺寸限制
 * @note 这个值在 chrome 以外的环境下可能是不同的！
 */
const IMAGE_MAX_SIZE = 16384

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

/** 地下图标外圆 */
const UG_OUTER_PATH = new Path2D(`
M 48.6801 56.4692
A 11.2 11.2 0 1 0 48.6801 34.0692
A 11.2 11.2 0 1 0 48.6801 56.4692
Z
`)

/** 地下图标中间 */
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

/** 地下图标预绘制 */
const UG_ICON = createSnapshot([64, 64], (ctx) => {
  ctx.clearRect(0, 0, 64, 64)
  ctx.fillStyle = '#333333'
  ctx.fill(UG_OUTER_PATH)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill(UG_INNER_PATH)
})

/** 编排元素使画板 */
const arrangeCanvas = ({ tagsPositionList, stateCount, typeCount, iconSize, gap }: {
  tagsPositionList: DBType.CacheTypes['tagSprite']['tagsPositionList']
  stateCount: number
  typeCount: number
  iconSize: number
  gap: number
}) => {
  const unitW = (iconSize + gap) * stateCount * typeCount
  const unitH = iconSize + gap

  let cols = 1
  let rows = tagsPositionList.length

  let width = unitW * cols
  let height = unitH * rows

  while (height > IMAGE_MAX_SIZE && width <= IMAGE_MAX_SIZE) {
    cols += 1
    rows = Math.ceil(tagsPositionList.length / cols)
    width = unitW * cols
    height = unitH * rows
  }

  if (width > IMAGE_MAX_SIZE)
    throw new Error(`预渲染纹理尺寸超出 WebGL 绘图限制`)

  return { cols, rows, canvasW: width, canvasH: height, unitW, unitH }
}

/** 生成 mapping */
const createMapping = ({
  tagsPositionList,
  states,
  iconSize = 64,
  gap = 0,
  types,
  rows,
  unitH,
  unitW,
  singleSize,
  stateCount,
}: MppingOptions, logger: Logger) => {
  // 关于 key 的格式
  // `${tag}.${state}.${type}`
  const mapping: IconMapping = {}

  let total = 0
  let tagCount = 0

  // 这里只有 3 个层级，但是有 4 层循环是因为有些 tag 复用了同一个图标
  // 在生成 tagSprite 的时候出于 worker 传输数据的考虑对数据进行了分组压缩
  tagsPositionList.forEach(({ tags }, posIndex) => {
    tagCount++
    states.forEach(({ state }, stateIndex) => {
      types.forEach(({ type }, typeIndex) => {
        const col = Math.floor(posIndex / rows)
        const row = posIndex - col * rows
        tags.forEach((tag) => {
          total++
          const startX = gap + col * unitW + singleSize * (stateCount * typeIndex + stateIndex)
          const startY = gap + row * unitH
          mapping[`${tag}.${state}.${type}`] = {
            x: startX,
            y: startY,
            width: iconSize,
            height: iconSize,
            anchorX: ANCHOR.X,
            anchorY: ANCHOR.Y,
          }
        })
      })
    })
  })

  logger.info('生成 mapping', { total, tagCount })

  return mapping
}

/**
 * #### 注意
 * 1. 每个图标状态以 64x64 分辨率进行绘制，其中的所有元素不得超过此范围
 * 2. 该函数必须以性能为优先考虑
 */
const render = async (options: WorkerInput, logger: Logger): Promise<WorkerSuccessOutput> => {
  const {
    tagSprite,
    tagSpriteDigest,
    tagsPositionList,
    outlineColor = '#33333360',
    states,
    iconSize = 64,
    gap = 0,
  } = options

  const types: { type: string; icon?: ImageBitmap }[] = [
    { type: 'default' },
    { type: 'underground', icon: UG_ICON },
  ]

  const stateCount = states.length
  const typeCount = types.length

  // 计算画板尺寸
  const { cols, rows, canvasW, canvasH, unitW, unitH } = arrangeCanvas({ tagsPositionList, stateCount, iconSize, gap, typeCount })

  /** 单个图标的实际占用尺寸 */
  const singleSize = 64 + gap

  const mappingOptions: MppingOptions = {
    ...options,
    types,
    rows,
    singleSize,
    stateCount,
    unitW,
    unitH,
  }

  // 如果存在缓存，则跳过绘制步骤，只生成 mapping
  const cache = await db.cache.get('markerSprite')
  if (cache && cache.id === 'markerSprite' && cache.value.tagSpriteDigest === tagSpriteDigest) {
    logger.info('缓存有效，跳过预渲染')
    return {
      image: cache.value.image,
      mapping: createMapping(mappingOptions, logger),
      tagSpriteDigest,
    }
  }

  const canvas = new OffscreenCanvas(canvasW, canvasH)
  const ctx = canvas.getContext('2d')!

  // 留出绘制间隙空间，用于避免舍入精度导致的层叠问题（在奇数图标尺寸下出现）
  ctx.translate(gap, gap)

  // 绘制 outline
  const outline = createSnapshot([singleSize, singleSize], (scopedCtx) => {
    scopedCtx.fillStyle = outlineColor
    scopedCtx.fill(OUTLINE_PATH)
  })
  ctx.fillStyle = ctx.createPattern(outline, 'repeat')!
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 绘制 border
  states.forEach(({ color }, stateIndex) => {
    ctx.fillStyle = ctx.createPattern(createSnapshot([singleSize, singleSize], (scopedCtx) => {
      scopedCtx.fillStyle = color
      scopedCtx.fill(BORDER_PATH)
    }), 'repeat')!
    types.forEach((_, typeIndex) => {
      for (let col = 0; col < cols; col++) {
        const startX = singleSize * (stateCount * typeIndex + stateIndex + col * stateCount * typeCount)
        ctx.fillRect(startX, 0, singleSize, canvasH)
      }
    })
  })

  // 绘制 content
  const spriteImage = await createImageBitmap(new Blob([tagSprite], { type: 'image/png' }))
  tagsPositionList.forEach(({ pos: [x, y] }, index) => {
    ctx.fillStyle = ctx.createPattern(createSnapshot([singleSize, singleSize], (scopedCtx) => {
      scopedCtx.clip(CONTENT_PATH)
      scopedCtx.translate(CENTER.X, CENTER.Y)
      scopedCtx.scale(CONTENT_SCALE, CONTENT_SCALE)
      scopedCtx.drawImage(spriteImage, x, y, 64, 64, -32, -32, 64, 64)
    }), 'repeat')!
    const col = Math.floor(index / rows)
    const startX = col * unitW
    const row = index - col * rows
    const startY = row * unitH
    ctx.fillRect(startX, startY, unitW, unitH)
  })

  // 绘制附加层
  const stateUnitWidth = singleSize * stateCount
  types.forEach(({ icon }, index) => {
    if (!icon)
      return
    ctx.fillStyle = ctx.createPattern(icon, 'repeat')!
    for (let col = 0; col < cols; col++) {
      const startX = stateUnitWidth * index + col * unitW
      ctx.fillRect(startX, 0, stateUnitWidth, canvasH)
    }
  })

  // 转换为图片
  const image = await (await canvas.convertToBlob()).arrayBuffer()
  logger.info('绘制结果', { cols, rows, canvasW, canvasH, byteLength: image.byteLength })

  const mapping = createMapping(mappingOptions, logger)

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

  return { image, mapping, tagSpriteDigest: '' }
}

globalThis.addEventListener('message', async (ev: MessageEvent<WorkerInput>) => {
  const [mainPort, loggerPort] = ev.ports
  const logger = new Logger('点位渲染', () => true, {
    port: loggerPort,
  })

  try {
    const res = await render(ev.data, logger)
    mainPort.postMessage(res, [res.image])
  }
  catch (err) {
    logger.error(err)
    mainPort.postMessage(err instanceof Error ? err.message : `${err}`)
  }
})
