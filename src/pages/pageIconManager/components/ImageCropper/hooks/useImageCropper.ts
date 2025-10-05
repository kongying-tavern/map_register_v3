import type { Unsubscribable } from 'rxjs'
import type { ShallowRef } from 'vue'
import type { IconVariant } from '@/pages/pageIconManager/types'
import { clamp } from '@vueuse/core'
import Konva from 'konva'
import { getObjectFitSize } from '@/utils'

const config = {
  anchorFill: '#FFF',
  anchorStroke: '#00CCFF',
}

/**
 * ### 图像裁切器 hook
 * - 确保在 `ready` 之后才调用相关 api
 */
export const useImageCropper = (
  containerRef: ShallowRef<HTMLDivElement | undefined>,
  options: ImageCropperOptions = {},
) => {
  const {
    disabled = false,
    keepRatio = false,
    variant = 'default',
  } = options

  /** 裁切器是否已经初始化完毕 */
  const { resolve, promise: ready } = Promise.withResolvers<Konva.Stage>()

  /** 裁切器上下文 */
  const context = {
    /** 场景 */
    stage: shallowRef<Konva.Stage | null>(null),
    /** 图层 */
    layer: shallowRef<Konva.Layer | null>(null),
    /** 控件 */
    transformer: shallowRef<Konva.Transformer | null>(null),
    /** 渲染回调 */
    animationFrame: shallowRef(-1),
    /** 内部事件处理器 */
    subscriptions: [] as Unsubscribable[],
  }

  /** 图片加载 hook */
  const imageHook = createEventHook<{
    variant: IconVariant
    bmp: ImageBitmap
    blob: Blob
    isRaw: boolean
  }>()
  /** 错误处理 hook */
  const errorHook = createEventHook<Error>()
  /** 渲染处理 hook */
  const frameHook = createEventHook<{
    stage: Konva.Stage
    image: Konva.Image
    rect: Konva.Rect
    circle: boolean
  }>()

  /** 错误捕获 */
  const catchError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.name === 'AbortError')
        return
      errorHook.trigger(err)
    }
    const error = new Error(typeof err === 'string' ? err : JSON.stringify(err))
    errorHook.trigger(error)
  }

  /** 清除裁切器 */
  const destory = () => {
    if (!context.stage.value)
      return
    context.subscriptions.forEach(({ unsubscribe }) => unsubscribe())
    context.subscriptions = []
    context.stage.value.destroy()
    cancelAnimationFrame(context.animationFrame.value)
    context.stage.value = null
    context.layer.value = null
    context.transformer.value = null
    context.animationFrame.value = -1
  }

  /** 初始化裁切器 */
  const setup = (div: HTMLDivElement) => {
    const stage = new Konva.Stage({
      container: div,
      width: div.clientWidth,
      height: div.clientHeight,
      listening: !toValue(disabled),
    })
    const resizeOb = new ResizeObserver(() => {
      const { clientWidth: cw, clientHeight: ch } = div
      stage.width(cw)
      stage.height(ch)
    })
    resizeOb.observe(div)
    context.subscriptions.push({
      unsubscribe: () => resizeOb.disconnect(),
    })
    context.stage.value = stage
    resolve(stage)
  }

  /** 将加载的图片装载为图层 */
  const setupLayer = (bmp: ImageBitmap) => {
    const stage = context.stage.value
    if (!stage)
      throw new Error('裁切器未初始化')
    if (context.layer.value) {
      context.layer.value.destroy()
      context.layer.value = null
      context.transformer.value = null
    }
    const { width: cw, height: ch } = stage.getSize()
    const { dx, dy, dw, dh } = getObjectFitSize('contain', cw, ch, bmp.width, bmp.height)
    // 创建图层
    const layer = new Konva.Layer()
    // 创建图片层
    const image = new Konva.Image({
      image: bmp,
      x: dx,
      y: dy,
      width: dw,
      height: dh,
    })
    layer.add(image)
    // 创建选区
    const rect = new Konva.Rect({
      x: dx,
      y: dy,
      width: dw,
      height: dh,
      draggable: true,
      dragBoundFunc({ x, y }) {
        const { width: w, height: h } = this.getClientRect()
        return {
          x: Math.round(clamp(x, dx, dx + dw - w)),
          y: Math.round(clamp(y, dy, dy + dh - h)),
        }
      },
    })
    const isDisabled = toValue(disabled)
    const tr = new Konva.Transformer({
      nodes: [rect],
      rotateEnabled: false,
      keepRatio: toValue(keepRatio),
      borderStroke: isDisabled ? 'transparent' : config.anchorStroke,
      anchorFill: isDisabled ? 'transparent' : config.anchorFill,
      anchorStroke: isDisabled ? 'transparent' : config.anchorStroke,
      anchorSize: 6,
      boundBoxFunc: ({ width: ow, height: oh }, { x, y, width: w, height: h }) => {
        const rect = {
          x: Math.round(clamp(x, dx, dx + dw - ow)),
          y: Math.round(clamp(y, dy, dy + dh - oh)),
          width: Math.round(clamp(w, 32, dw)),
          height: Math.round(clamp(h, 32, dh)),
          rotation: 0,
        }
        return rect
      },
    })
    context.transformer.value = tr
    // 交互样式
    rect.on('mouseover', () => {
      rect.fill('#00CCFF20')
      stage.getStage().container().style.cursor = 'move'
    })
    rect.on('mouseout', () => {
      rect.fill('transparent')
      stage.getStage().container().style.cursor = 'default'
    })
    layer.add(rect)
    layer.add(tr)
    // 添加到场景
    stage.add(layer)
    context.layer.value = layer
    cancelAnimationFrame(context.animationFrame.value)
    const render = () => {
      frameHook.trigger({
        stage,
        rect,
        image,
        circle: false,
      })
      context.animationFrame.value = requestAnimationFrame(render)
    }
    context.animationFrame.value = requestAnimationFrame(render)
  }

  if (isRef(keepRatio)) {
    watch(keepRatio, (v) => {
      const tr = context.transformer.value
      if (!tr)
        return
      tr.keepRatio(v)
    })
  }

  if (isRef(disabled)) {
    watch(disabled, (v) => {
      const stage = context.stage.value
      if (stage)
        stage.listening(!v)
      const transformer = context.transformer.value
      if (transformer) {
        transformer.anchorFill(v ? 'transparent' : config.anchorFill)
        transformer.anchorStroke(v ? 'transparent' : config.anchorStroke)
        transformer.borderStroke(v ? 'transparent' : config.anchorStroke)
      }
    })
  }

  /** 从文件选择器加载图片 */
  const loadFromFile = async (isRaw = false) => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.webp'],
            },
          },
        ],
      })
      const file = await handle.getFile()
      const bmp = await createImageBitmap(file)
      setupLayer(bmp)
      imageHook.trigger({
        bmp,
        blob: file,
        isRaw,
        variant: toValue(variant),
      })
    }
    catch (err) {
      catchError(err)
    }
  }

  /** 异步操作取消/中断的控制器 */
  const loadController = shallowRef<AbortController | null>(null)

  /** 从非本地源加载图片 */
  const loadFromSrc = async (
    /** 图源 */
    src: string | Blob | ArrayBuffer,
    options: {
      /** 是否为原始图片 */
      isRaw?: boolean
      /** 使用二进制源时指定图片的 MIME 类型 @default 'image/png' */
      type?: string
    } = {},
  ) => {
    const { isRaw = false, type = 'image/png' } = options
    try {
      loadController.value?.abort('Image Source Changed')
      const ac = new AbortController()
      loadController.value = ac
      // 加载图片
      const blob = await (async () => {
        if (src instanceof Blob)
          return src
        if (src instanceof ArrayBuffer)
          return new Blob([src], { type })
        const res = await fetch(src, { signal: ac.signal, mode: 'cors' })
        return res.blob()
      })()
      const bmp = await createImageBitmap(blob)
      setupLayer(bmp)
      imageHook.trigger({
        bmp,
        blob,
        isRaw,
        variant: toValue(variant),
      })
      return bmp
    }
    catch (err) {
      catchError(err)
    }
    finally {
      loadController.value = null
    }
  }

  watch(containerRef, (container) => {
    destory()
    container && setup(container)
  }, { immediate: true })

  return {
    ready,
    destory,
    loadFromFile,
    loadFromSrc,
    onImageLoad: imageHook.on,
    onError: errorHook.on,
    onFrame: frameHook.on,
  }
}

interface ImageCropperOptions {
  /** 是否禁用裁切器 */
  disabled?: MaybeRef<boolean>
  /** 是否保持选区宽高比 */
  keepRatio?: MaybeRef<boolean>
  /** 图标变体类型 */
  variant?: MaybeRef<IconVariant>
}
