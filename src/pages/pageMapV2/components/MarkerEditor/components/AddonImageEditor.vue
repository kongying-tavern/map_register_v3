<script lang="ts" setup>
import { CircleCheck, Delete, Plus, Scissor, Setting } from '@element-plus/icons-vue'
import { useLocalPicture, useMarkerPicture } from '../hooks'
import { AddonTeleporter } from '.'
import { formatByteSize } from '@/utils'
import { AppImageCropper } from '@/components'

// ==================== 表单图片 ====================
const modelValue = defineModel<string>('modelValue', {
  required: false,
  default: '',
})

const {
  initLoading,
  thumbImageUrl,
} = useMarkerPicture(modelValue)

// ==================== 待上传图片 ====================
const {
  loading,
  localPictureUrl: newPictureUrl,
  refresh: selectFile,
  onSuccess: onSelectSuccess,
  clear: clearLocalPicture,
} = useLocalPicture()

// ==================== 生成缩略图 ====================
const cropperRef = ref<InstanceType<typeof AppImageCropper> | null>(null)

const isCropped = computed(() => modelValue.value.toLowerCase().startsWith('blob:'))

const croppedImage = shallowRef<Blob>()
const croppedImageUrl = ref('')

onUnmounted(() => {
  URL.revokeObjectURL(croppedImageUrl.value)
})

const withoutSearchParams = (url?: string) => {
  if (!url)
    return ''
  const urlObj = new URL(url)
  return `${urlObj.protocol}${urlObj.pathname}`
}

const onCrop = (image: Blob) => {
  URL.revokeObjectURL(croppedImageUrl.value)

  croppedImage.value = image
  croppedImageUrl.value = URL.createObjectURL(image)

  const url = new URL(croppedImageUrl.value)
  url.searchParams.append('raw', newPictureUrl.value!)
  modelValue.value = url.toString()
}

// ====================  清除图片  ====================
const clearImage = () => {
  modelValue.value = ''
  croppedImage.value = undefined
  croppedImageUrl.value = ''
  URL.revokeObjectURL(croppedImageUrl.value)
  clearLocalPicture()
}

// ====================  附加组件  ====================
const addonId = defineModel<string>('addonId', {
  required: false,
  default: '',
})

const isAddonActived = computed({
  get: () => addonId.value === 'picture',
  set: (v) => {
    addonId.value = v ? 'picture' : ''
  },
})

onSelectSuccess((file) => {
  if (!file)
    return
  isAddonActived.value = true
})
</script>

<template>
  <div class="w-full flex justify-between">
    <div
      v-loading.fullscreen="loading"
      element-loading-text="等待文件系统响应..."
      element-loading-background="var(--el-mask-color-extra-light)"
      class="
        w-40 h-40 rounded overflow-hidden
        border border-dashed border-[var(--el-border-color)]
        hover:border-solid hover:border-[var(--el-border-color-hover)]
        cursor-pointer
        transition-[border-color]
      "
      @click="selectFile"
    >
      <img
        v-if="thumbImageUrl ?? modelValue"
        v-loading="initLoading"
        :src="isCropped ? withoutSearchParams(modelValue) : thumbImageUrl"
        crossorigin=""
        class="w-full h-full object-cover"
      >

      <div v-else class="w-full h-full flex flex-col items-center justify-center">
        <ElIcon :size="24">
          <Plus />
        </ElIcon>
        选择图片
      </div>
    </div>

    <div class="full flex-1 px-2 flex flex-col justify-between">
      <div class="flex flex-col justify-start">
        <el-button
          title="删除图片"
          plain
          type="danger"
          :icon="Delete"
          :disabled="!modelValue"
          style="width: 32px; padding: 0"
          @click="clearImage"
        />
      </div>
      <div v-if="croppedImage" class="flex items-center text-sm gap-1 text-[var(--el-color-success)] leading-none">
        <el-icon :size="16">
          <CircleCheck />
        </el-icon>
        <span>{{ formatByteSize(croppedImage.size) }}</span>
      </div>
    </div>

    <el-button
      :icon="Setting"
      :type="isAddonActived ? 'primary' : ''"
      title="编辑图像"
      circle
      @click="isAddonActived = !isAddonActived"
    />

    <AddonTeleporter :active="isAddonActived">
      <div class="w-full h-full flex flex-col gap-2">
        <el-alert type="warning" :closable="false">
          注意事项：
          <li>仅当通过裁切生成了新的缩略图时，编辑器才会在提交表单的同时对图像进行上传。</li>
          <li>裁切尺寸固定为 256x256。</li>
          <li>上传的图片并不会立即可用，需要等待CDN缓存刷新。</li>
        </el-alert>
        <div class="flex-1 grid place-items-center place-content-center gap-2">
          <AppImageCropper
            ref="cropperRef"
            :image="newPictureUrl ?? thumbImageUrl"
            :auto-crop-on-image-loaded="false"
            class="w-64 h-64"
            @crop="onCrop"
          />
          <el-button :icon="Scissor" :disabled="!newPictureUrl" @click="() => cropperRef?.crop()">
            裁切
          </el-button>
        </div>
        <el-alert type="info" :closable="false">
          操作指南：
          <ol class="list-disc">
            <li>拖拽图像移动焦点。</li>
            <li>滚轮缩放图像</li>
            <li>点击图像进行旋转</li>
          </ol>
        </el-alert>
      </div>
    </AddonTeleporter>
  </div>
</template>
