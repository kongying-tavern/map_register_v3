<script lang="ts" setup>
import { Plus, Scissor, Setting } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { AddonTeleporter } from '.'
import { getFileType } from '@/utils'
import { AppImageCropper } from '@/components'
import { useFetchHook } from '@/hooks'

const props = defineProps<{
  /** 上传大图 */
  largeImage?: Blob
  /** 裁切缩略图 */
  thumbImage?: Blob
  /** 原始缩略图 */
  rawThumbImageUrl?: string
  /** 上传描述 */
  content?: string
  /** 插件 id */
  addonId?: string
}>()

const emits = defineEmits<{
  'update:thumbImage': [Blob]
  'update:largeImage': [Blob]
  'update:addonId': [string | undefined]
}>()

const largeImageUrl = useObjectUrl(computed(() => props.largeImage))

const thumbImageUrl = useObjectUrl(computed(() => props.thumbImage))

const { loading, refresh: selectFile, onSuccess } = useFetchHook({
  onRequest: () => new Promise<Blob | undefined>((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false

    input.oncancel = () => {
      input.remove()
      resolve(undefined)
    }

    input.oninput = async () => {
      const file = input.files?.[0]
      input.remove()

      if (!file)
        return resolve(undefined)

      const realType = await getFileType(file)
      if (realType === 'unknown')
        return reject(new Error('不支持的图片类型'))

      resolve(file)
    }

    input.click()
  }),
})

const cropperRef = ref<InstanceType<typeof AppImageCropper> | null>(null)
const onCrop = (image: Blob) => {
  emits('update:thumbImage', image)
}

const isAddonActived = computed({
  get: () => props.addonId === 'picture',
  set: v => emits('update:addonId', v ? 'picture' : ''),
})

onSuccess((file) => {
  if (!file)
    return
  emits('update:largeImage', file)
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
      <img v-if="thumbImageUrl ?? rawThumbImageUrl" :src="thumbImageUrl ?? rawThumbImageUrl" crossorigin="" class="w-full h-full object-cover">
      <div v-else class="w-full h-full flex flex-col items-center justify-center">
        <ElIcon :size="24">
          <Plus />
        </ElIcon>
        选择图片
      </div>
    </div>

    <div class="h-40 flex-1 px-1 flex flex-col justify-end overflow-auto text-xs">
      <p v-for="(p, index) in content?.split('\n')" :key="index">
        {{ p }}
      </p>
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
          <ol class="list-decimal">
            <li>仅当通过裁切生成了新的缩略图时，编辑器才会在提交表单的同时对图像进行上传。</li>
            <li>大图会与缩略图一并上传，并在后续查看或编辑点位时可用。</li>
            <li>裁切尺寸固定为 256x256。</li>
            <li>上传的图片并不会立即可用，需要等待CDN缓存刷新。</li>
          </ol>
        </el-alert>
        <div class="flex-1 grid place-items-center place-content-center gap-2">
          <AppImageCropper
            ref="cropperRef"
            :image="largeImageUrl"
            :auto-crop-on-image-loaded="false"
            class="w-64 h-64"
            @crop="onCrop"
          />
          <el-button :icon="Scissor" :disabled="!largeImage" @click="() => cropperRef?.crop()">
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
