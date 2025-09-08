<script setup lang="ts">
import { ArrowDown, FolderOpened, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getObjectFitSize } from '@/utils'
import { useImageCropper } from './hooks'

const props = withDefaults(defineProps<{
  raw?: string
  loading?: boolean
}>(), {
  loading: false,
})

const emits = defineEmits<{
  outputChange: [size: { w: number, h: number }]
  imageLoad: [bmp: ImageBitmap, blob: Blob, isRaw: boolean, canvas: HTMLCanvasElement]
}>()

/** 裁切器界面 */
const config = ref({
  /** 原始尺寸 */
  rawSize: false,
  /** 圆形裁切 */
  clipCircle: false,
  /** 保持比例 */
  keepRatio: true,
})

/** 初始图像 */
const oldImage = shallowRef<ImageBitmap | null>(null)
/** 新图像 */
const newImage = shallowRef<ImageBitmap | null>(null)
/** 输出图像尺寸 */
const outputSize = ref({ w: 0, h: 0 })

/** 裁切容器 */
const containerRef = shallowRef<HTMLDivElement>()
/** 预览容器 */
const previewerRef = shallowRef<HTMLCanvasElement>()
/** 预览容器的上下文 */
const previewerCtxRef = shallowRef<CanvasRenderingContext2D>()
/** 预览容器尺寸 */
const previewerSize = computed(() => {
  if (!config.value.rawSize || !newImage.value)
    return { w: 64, h: 64 }
  return outputSize.value
})

const disabledEdit = computed(() => {
  return props.loading || !newImage.value
})

/** 裁切逻辑封装 */
const {
  ready,
  destory,
  loadFromFile,
  loadFromSrc,
  onFrame,
  onImageLoad,
  onError: onCropperError,
} = useImageCropper(containerRef, {
  disabled: disabledEdit,
  keepRatio: computed(() => config.value.keepRatio),
})

/** 恢复原始图片 */
const reset = () => {
  if (props.raw)
    loadFromSrc(props.raw, { raw: true })
}

/** 记录首次加载图片 */
const { off: off1 } = onImageLoad(([bmp, blob, isRaw]) => {
  if (!previewerRef.value)
    return
  if (isRaw) {
    oldImage.value = bmp
    newImage.value = null
  }
  else {
    newImage.value = bmp
  }
  emits('imageLoad', bmp, blob, isRaw, previewerRef.value)
})

/** 错误处理 */
const { off: off2 } = onCropperError((err) => {
  ElMessage.error(err.message)
})

/** 绘制裁切预览 */
onMounted(() => {
  const canvas = previewerRef.value!
  const ctx = canvas.getContext('2d', {

  })!
  previewerCtxRef.value = ctx
})

const { off: off3 } = onFrame(({ rect, image }) => {
  const ctx = previewerCtxRef.value
  if (!ctx)
    return
  const raw = newImage.value
  if (!raw)
    return
  const { width: cw, height: ch } = ctx.canvas
  ctx.clearRect(0, 0, cw, ch)
  ctx.save()
  const maxEdge = Math.max(cw, ch)
  const ccw = cw / 2
  const cch = ch / 2
  const r = maxEdge / 2
  const clipPath = new Path2D()
  clipPath.arc(ccw, cch, r, 0, 2 * Math.PI)
  if (config.value.clipCircle)
    ctx.clip(clipPath)
  // 基于原图尺寸渲染
  if (config.value.rawSize) {
    const { width: rawW, height: rawH } = raw
    const { x: baseX, y: baseY, width: baseW, height: baseH } = image.getClientRect()
    const { x: rectX, y: rectY, width: rectW, height: rectH } = rect.getClientRect()
    const x = rawW * (rectX - baseX) / baseW
    const y = rawH * (rectY - baseY) / baseH
    const w = Math.round(rawW * rectW / baseW)
    const h = Math.round(rawH * rectH / baseH)
    if (outputSize.value.w !== w)
      outputSize.value.w = w
    if (outputSize.value.h !== h)
      outputSize.value.h = h
    ctx.drawImage(raw, x, y, w, h, 0, 0, w, h)
    emits('outputChange', outputSize.value)
  }
  // 基于缩比场景渲染
  else {
    const { x: ix, y: iy } = image.getClientRect()
    const { x, y, width: w, height: h } = rect.getClientRect()
    const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', cw, ch, w, h)
    outputSize.value = { w: dw, h: dh }
    ctx.drawImage(image.toCanvas(), x + sx - ix, y + sy - iy, sw, sh, dx, dy, dw, dh)
    emits('outputChange', outputSize.value)
  }
  ctx.restore()
})

watch(() => props.raw, async (url) => {
  if (!url)
    return
  await ready
  await loadFromSrc(url, { raw: true })
}, { immediate: true })

onBeforeUnmount(() => {
  off1()
  off2()
  off3()
  destory()
})
</script>

<template>
  <div class="overflow-hidden flex flex-col gap-2">
    <div class="shrink-0 w-full flex gap-2">
      <!-- 裁切容器 -->
      <div ref="containerRef" class="shrink-0 w-[240px] h-[240px] chessboard-background" />

      <!-- 右侧状态栏 -->
      <div class="flex-1 h-[240px] flex flex-col">
        <el-button
          style="width: 100%"
          :icon="FolderOpened"
          :disabled="loading"
          @click="() => loadFromFile(false)"
        >
          选择图片
        </el-button>

        <!-- 修改前预览 -->
        <div v-if="raw" class="flex-1 flex flex-col gap-1 items-center justify-center">
          <img
            class="w-[66px] h-[66px] border border-[var(--el-border-color)] object-contain"
            :src="props.raw"
            draggable="false"
            crossorigin=""
          >
          <div class="shrink-0 text-xs">
            {{ (oldImage?.width ?? 0).toFixed(2) }} x {{ (oldImage?.height ?? 0).toFixed(2) }}
          </div>
        </div>

        <!-- 指向图标 -->
        <div v-show="(raw && newImage)" class="flex items-center justify-center">
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>

        <!-- 修改后预览 -->
        <div v-show="!raw || (raw && newImage)" class="flex-1 flex flex-col gap-1 items-center justify-center">
          <div class="w-[66px] h-[66px] border border-[var(--el-border-color)] relative scale-container">
            <canvas
              ref="previewerRef"
              class="scale-to-container"
              :style="{
                '--w': previewerSize.w,
                '--h': previewerSize.h,
              }"
              :class="{
                'raw-size': config.rawSize,
              }"
              :width="previewerSize.w"
              :height="previewerSize.h"
            />
          </div>

          <div class="shrink-0 text-xs">
            {{ outputSize.w.toFixed(2) }} x {{ outputSize.h.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="h-[32px] flex items-center">
      <div class="shrink-0 flex gap-4 items-center">
        <el-checkbox
          v-model="config.clipCircle"
          :disabled="disabledEdit"
          label="圆形裁切"
          style="margin: 0"
        />
        <el-checkbox
          v-model="config.rawSize"
          :disabled="disabledEdit"
          label="原始尺寸"
          style="margin: 0"
        />
        <el-checkbox
          v-model="config.keepRatio"
          :disabled="disabledEdit"
          label="保持比例"
          style="margin: 0"
        />
      </div>
      <div v-if="raw" class="flex-1 flex justify-end">
        <el-button
          size="small"
          :disabled="disabledEdit"
          :icon="Refresh"
          @click="reset"
        >
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chessboard-background {
  --s: 32px;
  --color-a: transparent;
  --color-b: var(--el-fill-color-darker);
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--color-a) 25%,
    var(--color-b) 25%,
    var(--color-b) 50%,
    var(--color-a) 50%,
    var(--color-a) 75%,
    var(--color-b) 75%,
    var(--color-b) 100%
  );
  background-size: var(--s) var(--s);
}

.scale-container {
  display: grid;
  place-content: center;
}

.scale-to-container {
  --scale: 1;
  transform-origin: center;
  transform: scale(var(--scale));
  &.raw-size {
    --scale: calc(min(64 / var(--w), 64 / var(--h)));
  }
}
</style>
