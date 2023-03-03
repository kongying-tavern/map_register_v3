<script lang="ts" setup>
/**
 * 明确一下该组件的逻辑
 * 1. 当原始图片没有被编辑时，isDefaultImage 为 true，此时 uploadPicture 函数会跳过上传
 * 2. 当原始图片变更时，isDefaultImage 为 false，thumbnailImage 变为 null，等待裁切缩略图，左侧缩略图会显示空白
 * 3. 当裁切缩略图后，thumbnailImage 有值，此时图片尚未上传，需要等待父级组件（即表单）点击确认
 * 4. 图片上传成功后，会修改表单的 picture 字段（图片地址）和 pictureCreatorId 字段（图片上传者）
 */
import { Plus, Setting } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { ElIcon, ElMessage, ElUpload } from 'element-plus'
import { usePictureUpload } from '../../hooks'
import { MarkerEditImageExtraPanel, TeleportExtra } from '.'
import { useUserStore } from '@/stores'

const props = defineProps<{
  /** 图片地址 */
  modelValue?: string
  /** 图片上传者 id */
  creatorId?: number
  extraId: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
  (e: 'update:creatorId', v?: number): void
  (e: 'update:extraId', v: string): void
}>()

const userStore = useUserStore()

/** 将图片地址解析为路径对象以便进行处理 */
const parseredUrlInfo = computed(() => {
  if (!props.modelValue)
    return {}
  const urlObj = new URL(props.modelValue)
  const paths = urlObj.pathname.split('/').filter(Boolean).map(unit => decodeURI(unit))
  const folderPath = paths.slice(0, -1).join('/')
  const filename = paths.at(-1)
  const nameUnits = filename?.split('.') ?? []
  const extname = nameUnits.at(-1)
  const basename = nameUnits.at(-2)
  return { urlObj, paths, folderPath, filename, basename, extname }
})

const isDefaultImage = ref(true)
const rawImage = shallowRef<Blob>()
const rawImageUrl = useObjectUrl(rawImage)
const thumbnailImage = shallowRef<Blob>()
const thumbnailUrl = useObjectUrl(thumbnailImage)
const rawImageBitmap = asyncComputed(async () => rawImage.value ? await createImageBitmap(rawImage.value) : undefined)
const uploaderRef = ref<InstanceType<typeof ElUpload> | null>(null)

/** 当选择新文件时 */
const onFileChange = async (uploadFile: UploadFile) => {
  // 不需要文件列表，清理掉之前的缓存
  uploaderRef.value?.handleRemove(uploadFile)
  const { raw } = uploadFile
  if (!raw) {
    ElMessage.error('文件可能已被删除或移动到其他位置，请重试')
    return
  }
  if (!/image\//.test(raw.type)) {
    ElMessage.error('只能选择图像文件')
    return
  }
  const blob = new Blob([await raw.arrayBuffer()])
  const imageBitmap = await createImageBitmap(blob)
  const { width, height } = imageBitmap
  if (width < 256 || height < 256) {
    ElMessage.error('不符合尺寸的图片，图片的长宽至少需要为 256x256')
    return
  }
  isDefaultImage.value = false
  rawImage.value = raw
}

/** 当加载原始图片时 */
onMounted(async () => {
  if (!props.modelValue)
    return
  try {
    const { basename, extname, folderPath, urlObj } = parseredUrlInfo.value
    const timestamp = new Date().getTime()
    // 加载原始缩略图
    const thumbImageBlob = await (await fetch(`${props.modelValue}?t=${timestamp}`, { mode: 'cors' })).blob()
    thumbnailImage.value = thumbImageBlob
    // 尝试请求原始大图（不一定成功，部分以前的点位并没有上传大图）
    const largeImagePath = `${urlObj?.origin}/${folderPath}/${basename}_large.${extname}`
    const rawImageBlob = await (await fetch(largeImagePath, { mode: 'cors' }).catch(() => null))?.blob()
    rawImageBlob && (rawImage.value = rawImageBlob)
  }
  catch {
    // 大图加载错误就无法编辑原图，只能上传新的来替换，这里不需要做别的处理
  }
})

const extraActive = computed(() => props.extraId === 'picture')
const toggleExtraPanel = () => {
  emits('update:extraId', extraActive.value ? '' : 'picture')
}

watch(rawImageUrl, (url) => {
  if (isDefaultImage.value)
    return
  url && emits('update:extraId', 'picture')
})

const { percentage, stepContent, uploadPicture } = usePictureUpload({
  rawImage,
  thumbnailImage,
})

// 对外暴露图片上传方法，在上传成功时更新图片地址和图片上传者 id 字段
defineExpose({
  uploadPicture: async () => {
    if (isDefaultImage.value)
      return
    const pictureUrl = await uploadPicture(parseredUrlInfo.value.basename)
    emits('update:modelValue', pictureUrl)
    emits('update:creatorId', userStore.info.id)
  },
})
</script>

<template>
  <div class="w-full flex justify-between gap-1">
    <ElUpload
      ref="uploaderRef"
      accept="image/*"
      :auto-upload="false"
      :show-file-list="false"
      @change="onFileChange"
    >
      <div class="picture-uploader" :class="{ active: extraActive }">
        <img v-if="thumbnailUrl" :src="thumbnailUrl" crossorigin="" class="w-full h-full object-cover">
        <div v-else class="w-full h-full flex flex-col items-center justify-center">
          <ElIcon :size="24">
            <Plus />
          </ElIcon>
          选择图片
        </div>
      </div>
    </ElUpload>

    <div class="h-full flex flex-1 flex-col justify-end">
      <el-progress v-if="percentage !== undefined" type="circle" :percentage="percentage" :status="percentage === 100 ? 'success' : ''" :width="100">
        <div class="text text-xl">
          {{ percentage }} %
        </div>
        <div>{{ stepContent }}</div>
      </el-progress>
    </div>

    <el-button :icon="Setting" :type="extraActive ? 'primary' : ''" title="编辑图像" circle @click="toggleExtraPanel" />

    <TeleportExtra :active="extraActive">
      <MarkerEditImageExtraPanel v-model:thumbnail-image="thumbnailImage" :image-bit-map="rawImageBitmap" />
    </TeleportExtra>
  </div>
</template>

<style lang="scss" scoped>
.picture-uploader {
  border: 1px dashed var(--el-border-color);
  width: 160px;
  height: 160px;
  border-radius: var(--el-border-radius-base);
  transition: var(--el-transition-duration-fast);
  color: var(--el-text-color-secondary);
  overflow: hidden;
  &:hover {
    border-color: var(--el-color-primary);
  }
  &.active {
    border-style: solid;
    border-color: var(--el-color-primary);
  }
}
</style>
