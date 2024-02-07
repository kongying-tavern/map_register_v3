<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { useImageLoad, useImageSelect, useImageUpload } from '../hooks'
import { IconImageSelect } from '.'
import { GlobalDialogController } from '@/hooks'
import { formatByteSize } from '@/utils'
import { AppImageCropper, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'

const props = defineProps<{
  icon: API.TagVo
}>()

const tagName = computed(() => props.icon.tag)

// ==================== Tab 操作 ====================
enum TabKey {
  /** 添加新图片 */
  UPLOAD = 'upload',
  /** 使用已有图片 */
  SELECT = 'select',
}

const tabs: { key: string; name: string }[] = [
  { key: TabKey.UPLOAD, name: '添加新图片' },
  { key: TabKey.SELECT, name: '使用已有图片' },
]

const activedTabKey = ref<TabKey>(TabKey.UPLOAD)

// ==================== 裁切图片 ====================
const { localImageUrl, loading: localImageLoading, loadLocalImage } = useImageLoad()

const croppedImage = shallowRef<Blob>()
const croppedImageUrl = useObjectUrl(croppedImage)

const onImageCrop = (image: Blob) => {
  croppedImage.value = image
}

// ==================== 上传图片 ====================
const { croppedImageName, loading: uploadLoading, percentage, status, text, uploadImage } = useImageUpload({
  image: croppedImage,
  tagName,
})

// ==================== 复用图片 ====================
const { selectedImage, useImage, loading: selectLoading } = useImageSelect({
  tagName,
})

// ==================== 弹窗操作 ====================
const confirmDisabled = computed(() => ({
  [TabKey.UPLOAD]: () => !croppedImageUrl.value || !croppedImageName.value,
  [TabKey.SELECT]: () => !selectedImage.value,
})[activedTabKey.value]())

const confirmLoading = computed(() => ({
  [TabKey.UPLOAD]: uploadLoading,
  [TabKey.SELECT]: selectLoading,
})[activedTabKey.value].value)

const confirm = async () => {
  if (confirmDisabled.value)
    return
  await ({
    [TabKey.UPLOAD]: uploadImage,
    [TabKey.SELECT]: useImage,
  })[activedTabKey.value]()
}

const cancel = () => {
  if (confirmLoading.value)
    return
  GlobalDialogController.close()
}
</script>

<template>
  <WinDialog
    v-loading.fullscreen="localImageLoading"
    element-loading-text="等待文件系统响应..."
    element-loading-background="var(--el-mask-color-extra-light)"
  >
    <WinDialogTitleBar
      :disabled="confirmLoading"
      @close="cancel"
    >
      {{ icon.tag }} 修改图片
    </WinDialogTitleBar>

    <el-alert type="warning" style="margin-bottom: 0">
      注意：修改图片不会立即生效，需要等待服务器刷新缓存。
    </el-alert>

    <WinDialogTabPanel
      v-model:tab-key="activedTabKey"
      class="w-[370px] h-[340px]"
      :tabs="tabs"
      :tabs-disabled="confirmLoading"
    >
      <div v-show="activedTabKey === TabKey.UPLOAD" class="grid gap-2 grid-cols-[auto_1fr]">
        <el-input v-model="croppedImageName" class="col-span-2" placeholder="请输入图标名称">
          <template #prefix>
            <span class="text-xs text-[var(--el-color-danger)] select-none">
              *
            </span>
          </template>
          <template #suffix>
            <span class="text-xs select-none" :class="!croppedImageName.length ? 'text-[var(--el-color-danger)]' : ''">
              {{ croppedImageName.length }} / {{ 16 }}
            </span>
          </template>
        </el-input>

        <AppImageCropper
          class="flex-shrink-0 w-64 h-64"
          :image="localImageUrl"
          :crop-ratio="0.25"
          auto-crop
          @crop="onImageCrop"
        />

        <div class="w-full flex flex-col justify-between">
          <el-button @click="loadLocalImage">
            {{ localImageUrl ? '切换' : '选择' }}图片
          </el-button>
          <el-divider style="margin: 8px 0 0" />
          <div class="flex-1 grid place-items-center place-content-center gap-1">
            <div class="w-16 h-16 border border-[var(--el-border-color)] box-content">
              <img v-if="croppedImageUrl" class="w-full h-full" :src="croppedImageUrl" crossorigin="">
            </div>
            <div class=" text-xs">
              64x64 px
            </div>
            <div v-if="croppedImage" class=" text-xs">
              {{ formatByteSize(croppedImage.size) }}
            </div>
          </div>
        </div>

        <el-progress
          v-if="text"
          :percentage="percentage"
          :status="status"
          :duration="4"
          :stroke-width="18"
          :striped-flow="uploadLoading"
          striped
          text-inside
          class="col-span-2"
          style="--progress-radius: 4px"
        >
          {{ text }}
        </el-progress>
      </div>

      <IconImageSelect v-show="activedTabKey === TabKey.SELECT" v-model="selectedImage" />
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button
        type="primary"
        :icon="Check"
        :loading="uploadLoading"
        :disabled="confirmDisabled"
        @click="confirm"
      >
        确认
      </el-button>
      <el-button :icon="Close" :disabled="uploadLoading" @click="cancel">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
