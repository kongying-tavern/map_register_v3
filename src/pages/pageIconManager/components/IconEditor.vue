<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus'
import { GlobalDialogController, useFetchHook } from '@/hooks'
import { sleep } from '@/utils'
import { AppImageCropper } from '@/components'

const props = defineProps<{
  icon: API.TagVo
}>()

const url = ref(props.icon.url)
const cropImageUrl = ref(props.icon.url)

const selectImage = () => {
  const loading = ElLoading.service({
    text: '等待图片...',
    background: 'var(--el-overlay-color-lighter)',
  })
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = false
  input.onchange = () => {
    loading.close()
    const file = input.files?.[0]
    if (!file)
      return
    input.remove()
    if (url.value?.startsWith('blob:'))
      URL.revokeObjectURL(url.value)
    url.value = URL.createObjectURL(file)
  }
  input.click()
}

const imageCropperRef = ref<InstanceType<typeof AppImageCropper> | null>(null)
const cropImage = async () => {
  if (!imageCropperRef.value)
    return
  const image = await imageCropperRef.value.crop()
  if (cropImageUrl.value?.startsWith('blob:'))
    URL.revokeObjectURL(cropImageUrl.value)
  cropImageUrl.value = URL.createObjectURL(image)
}

const { refresh: updateIconImage, loading } = useFetchHook({
  onRequest: async () => {
    await sleep(3000)
  },
})

const closeDialog = () => {
  if (loading.value)
    return
  GlobalDialogController.close()
}
</script>

<template>
  <div
    class="rounded-lg
      flex flex-col overflow-hidden
      bg-[var(--el-fill-color)]
      border border-[var(--el-color-primary-light-9)]"
  >
    <div class="flex justify-between items-center mb-2 bg-[var(--el-color-primary-light-9)]">
      <div class="flex-1 p-1.5 px-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
        {{ icon.tag }} 修改图片
      </div>

      <div
        class="p-1.5 px-2
          h-full
          flex
          items-center
          hover:bg-[var(--el-color-danger)]
          hover:text-[var(--el-bg-color)]
          active:bg-[var(--el-color-danger-light-3)]
          active:text-[var(--el-bg-color)]
          transition-all
          select-none"
        @click="closeDialog"
      >
        <el-icon :size="16">
          <Close />
        </el-icon>
      </div>
    </div>

    <div
      class="flex-1 mx-2
        p-2 overflow-auto
        border border-[var(--el-border-color)]
        bg-[var(--el-bg-color)]"
    >
      <div class="mb-1">
        使用新图片：
      </div>
      <div class="flex gap-2">
        <AppImageCropper ref="imageCropperRef" class="flex-shrink-0 w-64 h-64" :url="url" />

        <div class="w-full flex flex-col justify-between">
          <el-button @click="selectImage">
            选择图片
          </el-button>
          <div class="divider" />
          <div class="flex-1 grid place-items-center place-content-center gap-2">
            <div>预览</div>
            <div v-if="!cropImageUrl" class="w-16 h-16 border border-[var(--el-border-color)]" />
            <img v-else class="w-16 h-16" :src="cropImageUrl">
            <div class=" text-xs">
              64x64 px
            </div>
          </div>
          <div class="divider" />
          <el-button @click="cropImage">
            裁切图片
          </el-button>
        </div>
      </div>

      <div class="divider" />

      <div class="mb-1 flex items-center gap-2">
        <div class=" whitespace-nowrap">
          使用已有图片：
        </div>
        <el-input size="small" placeholder="搜索名称..." />
      </div>
      <div class="h-32 grid grid-cols-10 grid-rows-4 overflow-auto">
        <div v-for="i in 100" :key="i" class="w-8 h-8 border" />
      </div>
    </div>

    <div class="flex justify-end p-2">
      <el-button type="primary" :icon="Check" :loading="loading" disabled @click="updateIconImage">
        确认
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="closeDialog">
        取消
      </el-button>
    </div>

    <el-alert type="warning" :closable="false">
      <div>TODOs</div>
      <ol>
        <li>1. 支持拖入图片</li>
        <li>2. 缩放时以视口中心为旋转中心，保持尺寸不变</li>
      </ol>
    </el-alert>
  </div>
</template>

<style scoped>
.divider {
  height: 1px;
  background: var(--el-border-color);
  margin: 8px 0;
}
</style>
