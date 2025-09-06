<script lang="ts" setup>
import { ArrowDown, Check, Close, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { getObjectFitSize } from '@/utils'
import { useImageCropper } from '../hooks'

const props = defineProps<{
  icon: API.IconVo
}>()

const emits = defineEmits<{
  close: []
}>()

const rawJSON = JSON.stringify(props.icon)

const iconForm = ref<API.IconVo>(JSON.parse(rawJSON))

const config = ref({
  clipCircle: false,
  keepRatio: false,
})

const outputSize = ref({ w: 0, h: 0 })
const rawImage = shallowRef<ImageBitmap | null>(null)

const containerRef = shallowRef<HTMLDivElement>()
const {
  ready,
  destory,
  loadFromFile,
  loadFromUrl,
  onFrame,
  onImageLoad,
  onError: onCropperError,
} = useImageCropper(containerRef, {
  keepRatio: computed(() => config.value.keepRatio),
})

onImageLoad((bmp) => {
  if (rawImage.value !== null)
    return
  rawImage.value = bmp
})

onCropperError((err) => {
  ElMessage.error(err.message)
})

const previewerRef = shallowRef<HTMLCanvasElement>()
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
    ctx.drawImage(image.toCanvas(), x + sx - ix, y + sy - iy, sw, sh, dx, dy, dw, dh)
    ctx.restore()
  })
})

watch(() => props.icon.url, async (url) => {
  if (!url)
    return
  await ready
  await loadFromUrl(url)
}, { immediate: true })

const cancel = () => {
  emits('close')
}

onBeforeUnmount(() => {
  destory()
})
</script>

<template>
  <WinDialog
    element-loading-text="等待文件系统响应..."
    element-loading-background="var(--el-mask-color-extra-light)"
  >
    <WinDialogTitleBar
      @close="cancel"
    >
      编辑图标 | {{ icon.tag }}
    </WinDialogTitleBar>

    <WinDialogTabPanel
      class="w-[384px] mb-0 flex flex-col"
    >
      <el-form
        :model="iconForm"
        label-width="60px"
        class="w-full shrink-0 overflow-hidden"
      >
        <el-form-item label="名称" prop="tag">
          <el-input v-model="iconForm.tag" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="iconForm.description" type="textarea" />
        </el-form-item>
      </el-form>

      <div class="flex-1 w-full overflow-hidden flex gap-2">
        <div class="shrink-0 w-[240px] flex flex-col gap-2">
          <!-- 裁切容器 -->
          <div ref="containerRef" class="w-full h-[240px] chessboard-background" />

          <div class="h-[32px] flex items-center">
            <el-checkbox v-model="config.clipCircle" label="圆形" />
            <el-checkbox v-model="config.keepRatio" label="保持比例" />
          </div>
        </div>

        <div class="flex-1 h-[280px] flex flex-col gap-2 justify-between">
          <div class="w-full shrink-0">
            <el-button style="width: 100%" :icon="Upload" @click="loadFromFile">
              选择图片
            </el-button>
          </div>

          <div class="flex-1 flex flex-col gap-1 items-center justify-center">
            <!-- 修改前预览 -->
            <img
              class="border border-[var(--el-border-color)]"
              :src="props.icon.url"
              draggable="false"
              crossorigin=""
            >
            <div class="shrink-0 text-xs">
              {{ (rawImage?.width ?? 0).toFixed(1) }} x {{ (rawImage?.height ?? 0).toFixed(1) }}
            </div>
          </div>

          <div class="flex items-center justify-center">
            <el-icon>
              <ArrowDown />
            </el-icon>
          </div>

          <div class="flex-1 flex flex-col gap-1 items-center justify-center">
            <!-- 修改后预览 -->
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

          <div class="shrink-0 w-full h-[32px]" />
        </div>
      </div>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button
        type="primary"
        :icon="Check"
      >
        确认
      </el-button>
      <el-button
        :icon="Close"
        @click="cancel"
      >
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
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
