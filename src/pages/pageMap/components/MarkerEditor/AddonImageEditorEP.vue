<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fromEvent as fromRefEvent } from '@vueuse/rxjs'
import type { Observable } from 'rxjs'
import { filter, fromEvent, map, switchMap, takeUntil } from 'rxjs'
import type { Ref } from 'vue'
import { clamp } from 'lodash'

const props = withDefaults(defineProps<{
  imageBitMap?: ImageBitmap
  thumbnailImage?: Blob
  objectFit?: 'cover' | 'contain'
}>(), {
  objectFit: 'cover',
})

const emits = defineEmits<{
  (e: 'update:thumbnailImage', v?: Blob): void
}>()

const { max, min } = Math

const canvasRef = ref() as Ref<HTMLCanvasElement>
const canvasCtx = computed(() => canvasRef.value?.getContext('2d') ?? null)
const { width: w, height: h } = useElementBounding(canvasRef)

/** 绑定的缩略图 */
const internalBind = computed({
  get: () => props.thumbnailImage,
  set: v => emits('update:thumbnailImage', v),
})

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
const minZoom = computed(() => (props.objectFit === 'cover' ? max : min)(w.value / iw.value, h.value / ih.value) || 1)
/** 最大缩放比 */
const maxZoom = 2
/** 单次放大倍率 */
const deltaEnlarge = 1.1
/** 单次缩小倍率 */
const deltaNarrow = 1 / deltaEnlarge
/** 图像左上角坐标 */
const position = ref<[number, number]>([NaN, NaN])

// ========== 事件观察者 ==========
const wheel = fromRefEvent(canvasRef, 'wheel') as Observable<WheelEvent>
const pointerdown = fromRefEvent(canvasRef, 'pointerdown') as Observable<PointerEvent>
const pointerover = fromRefEvent(canvasRef, 'pointerover') as Observable<PointerEvent>
const pointerout = fromRefEvent(canvasRef, 'pointerout') as Observable<PointerEvent>
const pointermove = fromEvent<PointerEvent>(window, 'pointermove') as Observable<PointerEvent>
const click = fromEvent<PointerEvent>(window, 'click')

watch(zoom, (newZoom, oldZoom) => {
  const deltaZoom = newZoom / oldZoom
  const offsetX = deltaZoom * (position.value[0] - cx.value) + cx.value
  const offsetY = deltaZoom * (position.value[1] - cy.value) + cy.value
  const posX = zw.value < w.value
    ? max(0, min(offsetX, rw.value))
    : max(rw.value, min(offsetX, 0))
  const posY = zh.value < h.value
    ? max(0, min(offsetY, rh.value))
    : max(rh.value, min(offsetY, 0))
  position.value = [posX, posY]
})

/** 平移 */
pointerdown.pipe(
  filter(() => props.imageBitMap !== undefined),
  map(({ x, y }) => ([x, y, ...position.value])),
  switchMap(([startX, startY, cacheX, cacheY]) => pointermove.pipe(
    takeUntil(click),
    takeUntil(wheel),
    map(({ x: moveX, y: moveY }) => {
      const offsetX = cacheX + moveX - startX
      const posX = zw.value < w.value ? clamp(offsetX, 0, rw.value) : clamp(offsetX, rw.value, 0)
      const offsetY = cacheY + moveY - startY
      const posY = zh.value < h.value ? clamp(offsetY, 0, rh.value) : clamp(offsetY, rh.value, 0)
      return [posX, posY] as [number, number]
    }),
  )),
).subscribe(pos => (position.value = pos))

/** 缩放 */
pointerover.pipe(
  filter(() => props.imageBitMap !== undefined),
  switchMap(() => wheel.pipe(
    takeUntil(pointerout),
    map((ev) => {
      ev.preventDefault()
      return ev.deltaY
    }),
    map(deltaY => deltaY < 0
      ? zoom.value >= maxZoom
        ? 1
        : zoom.value * deltaEnlarge >= maxZoom
          ? maxZoom / zoom.value
          : deltaEnlarge
      : zoom.value <= minZoom.value
        ? 1
        : zoom.value * deltaNarrow <= minZoom.value
          ? minZoom.value / zoom.value
          : deltaNarrow,
    ),
  )),
).subscribe(deltaZoom => (zoom.value *= deltaZoom))

/** 渲染 */
const useRenderer = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingEnabled = true
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

/** 剪裁尺寸 */
const clipSize = ref<[number, number]>([256, 256])

/** 剪裁 */
const clipImage = () => {
  if (!canvasRef.value || !canvasCtx.value) {
    ElMessage.error('无法获取 canvas 实例')
    return
  }
  // 数据为空
  if (!props.imageBitMap)
    return
  const resizeCanvas = document.createElement('canvas')
  resizeCanvas.width = clipSize.value[0]
  resizeCanvas.height = clipSize.value[1]
  const resizeCtx = resizeCanvas.getContext('2d')
  if (!resizeCtx) {
    ElMessage.error('创建 canvas 实例失败')
    return
  }
  resizeCtx.drawImage(canvasRef.value, 0, 0, ...clipSize.value)
  resizeCanvas.toBlob((blob) => {
    if (!blob) {
      ElMessage.error('无法获取截图的二进制数据')
      return
    }
    internalBind.value = blob
  })
}

// 切换图片时重置缩放和中心点
watch(() => props.imageBitMap, () => {
  internalBind.value = undefined
  zoom.value = 0
  position.value = [NaN, NaN]
})

onMounted(() => {
  if (!canvasCtx.value)
    return
  useRenderer(canvasCtx.value)()
})
</script>

<template>
  <div class="h-full flex flex-col gap-2">
    <el-alert :closable="false">
      1. 仅编辑缩略图，原始图像将会作为大图被一并上传。
      <br>
      2. 由于跨域策略限制，部分已上传的图像无法再被编辑，如需更改图片请重新上传。
    </el-alert>

    <div ref="containerRef" class="canvas-container aspect-square rounded overflow-hidden">
      <canvas ref="canvasRef" class="w-full h-full select-none" :width="w" :height="h" />
    </div>

    <div class="w-full h-20 grid grid-cols-4 grid-rows-2 gap-x-2 items-center justify-start">
      <div class="col-span-3 flex items-center">
        尺寸：
        <el-input v-model="clipSize[0]" class="flex-1" disabled />
        <el-icon :size="20" class="px-1">
          <Close />
        </el-icon>
        <el-input v-model="clipSize[1]" class="flex-1" disabled />
      </div>
      <div class="col-span-3 row-start-2 flex items-center whitespace-nowrap">
        缩放：
        <el-input-number v-model="zoom" :min="minZoom" :max="maxZoom" :step="0.05" class="flex-1" :disabled="!imageBitMap" />
      </div>
      <el-button class="row-span-2" style="height: 74px" :disabled="!imageBitMap" @click="clipImage">
        确认剪裁
      </el-button>
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
