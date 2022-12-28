<script lang="ts" setup>
const props = defineProps<{
  imageBitMap: ImageBitmap | null
}>()

const { max, min } = Math

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { width: w, height: h } = useElementBounding(canvasRef)

/** canvas 中心点 x 坐标 */
const cx = computed(() => w.value / 2)
/** canvas 中心点 y 坐标 */
const cy = computed(() => h.value / 2)
/** 图像缩放比 */
const zoom = ref(0)
/** 图像原始宽度 */
const iw = computed(() => props.imageBitMap ? props.imageBitMap.width : 0)
/** 图像原始高度 */
const ih = computed(() => props.imageBitMap ? props.imageBitMap.height : 0)
/** 缩放后图像宽度 */
const zw = computed(() => iw.value * zoom.value)
/** 缩放后图像高度 */
const zh = computed(() => ih.value * zoom.value)
/** 缩放后水平方向上剩余可移动的尺寸 */
const rw = computed(() => w.value - zw.value)
/** 缩放后垂直方向上剩余可移动的尺寸 */
const rh = computed(() => h.value - zh.value)
/** 最小缩放比 */
const minZoom = computed(() => min(w.value / iw.value, h.value / ih.value) || 1)
/** 最大缩放比 */
const maxZoom = 2
/** 单次放大倍率 */
const deltaEnlarge = 1.1
/** 单次缩小倍率 */
const deltaNarrow = 1 / deltaEnlarge
/** 图像左上角坐标 */
const position = ref<[number, number]>([NaN, NaN])

// 切换图片时重置缩放和中心点
watch(() => props.imageBitMap, () => {
  zoom.value = 0
  position.value = [NaN, NaN]
})

/** 平移 */
useEventListener<PointerEvent>(canvasRef, 'pointerdown', ({ x: startX, y: startY }) => {
  const [cacheX, cacheY] = position.value
  const stopListenMove = useEventListener(window, 'pointermove', ({ x: moveX, y: moveY }) => {
    const offsetX = cacheX + moveX - startX
    const posX = zw.value < w.value
      ? max(0, min(offsetX, rw.value))
      : max(rw.value, min(offsetX, 0))
    const offsetY = cacheY + moveY - startY
    const posY = zh.value < h.value
      ? max(0, min(offsetY, rh.value))
      : max(rh.value, min(offsetY, 0))
    position.value = [posX, posY]
  })
  const stopListenUp = useEventListener('click', () => {
    stopListenMove()
    stopListenUp()
  })
})

/** 缩放 */
useEventListener(canvasRef, 'pointerover', () => {
  const stopListenScroll = useEventListener<WheelEvent>(canvasRef, 'wheel', (ev) => {
    ev.preventDefault()
    const { deltaY } = ev
    // 滚轮向上滚则缩小图像，向下滚则放大图像
    const deltaZoom = deltaY < 0
      ? zoom.value >= maxZoom
        ? 1
        : zoom.value * deltaEnlarge >= maxZoom
          ? maxZoom / zoom.value
          : deltaEnlarge
      : zoom.value <= minZoom.value
        ? 1
        : zoom.value * deltaNarrow <= minZoom.value
          ? minZoom.value / zoom.value
          : deltaNarrow
    zoom.value *= deltaZoom
    const offsetX = deltaZoom * (position.value[0] - cx.value) + cx.value
    const offsetY = deltaZoom * (position.value[1] - cy.value) + cy.value
    const posX = zw.value < w.value
      ? max(0, min(offsetX, rw.value))
      : max(rw.value, min(offsetX, 0))
    const posY = zh.value < h.value
      ? max(0, min(offsetY, rh.value))
      : max(rh.value, min(offsetY, 0))
    position.value = [posX, posY]
  }, { passive: false })
  const stopListenOut = useEventListener(canvasRef, 'pointerout', () => {
    stopListenScroll()
    stopListenOut()
  })
})

/** 渲染 */
const useRenderer = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingQuality = 'high'

  const clearCanvas = () => {
    ctx.clearRect(0, 0, w.value, h.value)
  }

  const drawImage = () => {
    if (!props.imageBitMap)
      return
    const { width: sw, height: sh } = props.imageBitMap
    // 初始化缩放比
    if (!zoom.value)
      zoom.value = minZoom.value
    // 初始化坐标
    if (position.value.every(isNaN))
      position.value = [cx.value - zw.value / 2, cy.value - zh.value / 2]
    const dw = sw * (zoom.value || minZoom.value)
    const dh = sh * (zoom.value || minZoom.value)
    const [dx, dy] = position.value
    ctx.drawImage(props.imageBitMap, 0, 0, sw, sh, dx, dy, dw, dh)
  }

  const render = () => {
    clearCanvas()
    drawImage()
    requestAnimationFrame(render)
  }

  return render
}

onMounted(() => {
  const ctx = canvasRef.value?.getContext('2d')
  if (!ctx)
    return
  useRenderer(ctx)()
})
</script>

<template>
  <div class="h-full flex flex-col gap-2">
    <div ref="containerRef" class="canvas-container aspect-square rounded overflow-hidden">
      <canvas ref="canvasRef" class="w-full h-full select-none" :width="w" :height="h" />
    </div>

    <div class="w-full flex-1 flex justify-center">
      <el-button>确认编辑</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.canvas-container {
  background:
    linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%),
    linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%);
  background-size: 1rem 1rem;
  background-position: 0 0, 0.5rem 0.5rem;
}
</style>
