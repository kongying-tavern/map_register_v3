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
  imageLoad: [bmp: ImageBitmap, blob: Blob, fromURL: boolean, canvas: HTMLCanvasElement]
}>()

/** 裁切器界面 */
const config = ref({
  /** 圆形裁切 */
  clipCircle: false,
  /** 保持比例 */
  keepRatio: true,
})

/** 原始图像 */
const rawImage = shallowRef<ImageBitmap | null>(null)
/** 输出图像尺寸 */
const outputSize = ref({ w: 0, h: 0 })
/** 是否为新图像 */
const isNewImage = ref(false)

/** 裁切容器 */
const containerRef = shallowRef<HTMLDivElement>()
/** 预览容器 */
const previewerRef = shallowRef<HTMLCanvasElement>()

/** 裁切逻辑封装 */
const {
  ready,
  destory,
  loadFromFile,
  loadFromUrl,
  onFrame,
  onImageLoad,
  onError: onCropperError,
} = useImageCropper(containerRef, {
  disabled: computed(() => props.loading || !isNewImage.value),
  keepRatio: computed(() => config.value.keepRatio),
})

/** 恢复原始图片 */
const reset = () => {
  if (props.raw)
    loadFromUrl(props.raw)
}

/** 记录首次加载图片 */
const { off: off1 } = onImageLoad(([bmp, blob, fromURL]) => {
  if (!previewerRef.value)
    return
  isNewImage.value = !fromURL
  emits('imageLoad', bmp, blob, fromURL, previewerRef.value)
})

/** 错误处理 */
const { off: off2 } = onCropperError((err) => {
  ElMessage.error(err.message)
})

onMounted(() => {
  const previewer = previewerRef.value
  if (!previewer)
    return
  const ctx = previewer.getContext('2d')!
  onFrame(({ rect, image }) => {
    const { x: ix, y: iy } = image.getClientRect()
    const { x, y, width: w, height: h } = rect.getClientRect()
    ctx.clearRect(0, 0, 64, 64)
    ctx.save()
    if (config.value.clipCircle)
      ctx.clip(new Path2D('M32,0 A32,32 0,0,1 32,64 A32,32 0,0,1 32,0 Z'))
    const { sx, sy, sw, sh, dx, dy, dw, dh } = getObjectFitSize('contain', 64, 64, w, h)
    outputSize.value = { w: dw, h: dh }
    emits('outputChange', outputSize.value)
    ctx.drawImage(image.toCanvas(), x + sx - ix, y + sy - iy, sw, sh, dx, dy, dw, dh)
    ctx.restore()
  })
})

watch(() => props.raw, async (url) => {
  if (!url)
    return
  await ready
  const bmp = await loadFromUrl(url)
  rawImage.value = bmp ?? null
}, { immediate: true })

onBeforeUnmount(() => {
  destory()
  off1()
  off2()
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
          @click="loadFromFile"
        >
          选择图片
        </el-button>

        <!-- 修改前预览 -->
        <div class="flex-1 flex flex-col gap-1 items-center justify-center">
          <img
            class="w-[66px] h-[66px] border border-[var(--el-border-color)] object-contain"
            :src="props.raw"
            draggable="false"
            crossorigin=""
          >
          <div class="shrink-0 text-xs">
            {{ (rawImage?.width ?? 0).toFixed(2) }} x {{ (rawImage?.height ?? 0).toFixed(2) }}
          </div>
        </div>

        <!-- 指向图标 -->
        <div v-show="isNewImage" class="flex items-center justify-center">
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>

        <!-- 修改后预览 -->
        <div v-show="isNewImage" class="flex-1 flex flex-col gap-1 items-center justify-center">
          <canvas
            ref="previewerRef"
            class="border border-[var(--el-border-color)]"
            width="64"
            height="64"
          />
          <div class="shrink-0 text-xs">
            {{ outputSize.w.toFixed(2) }} x {{ outputSize.h.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="h-[32px] flex items-center">
      <div class="flex-1 flex items-center">
        <el-checkbox
          v-model="config.clipCircle"
          :disabled="loading || !isNewImage"
          label="圆形裁切"
        />
        <el-checkbox
          v-model="config.keepRatio"
          :disabled="loading || !isNewImage"
          label="保持比例"
        />
      </div>
      <div class="shrink-0 flex justify-end">
        <el-button
          size="small"
          :disabled="loading || !isNewImage"
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
</style>
