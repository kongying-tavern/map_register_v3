<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { useImageLoad, useImageSelect, useImageUpload } from '../hooks'
import { IconImageSelect } from '.'
import { GlobalDialogController } from '@/hooks'
import { formatByteSize } from '@/utils'
import { AppImageCropper } from '@/components'

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

const tabs = {
  [TabKey.UPLOAD]: '添加新图片',
  [TabKey.SELECT]: '使用已有图片',
}

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

const setTab = (name: TabKey) => {
  if (confirmLoading.value)
    return
  activedTabKey.value = name
}

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
  <div
    v-loading.fullscreen="localImageLoading"
    element-loading-text="等待文件系统响应..."
    element-loading-background="var(--el-mask-color-extra-light)"
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
          transition-all
          select-none"
        :class="[
          confirmLoading
            ? 'cursor-not-allowed'
            : '\
            hover:bg-[var(--el-color-danger)]\
            hover:text-[var(--el-bg-color)]\
            active:bg-[var(--el-color-danger-light-3)]\
            active:text-[var(--el-bg-color)]',
        ]"
        @click="cancel"
      >
        <el-icon :size="16">
          <Close />
        </el-icon>
      </div>
    </div>

    <el-alert type="warning" style="margin-bottom: 8px">
      注意：上传的图片不会立即可用，需要等待服务端刷新缓存。
    </el-alert>

    <div class="tabs flex tab mx-2 text-xs">
      <div
        v-for="(name, key) in tabs"
        :key="key"
        :class="{ actived: key === activedTabKey }"
        class="tab-item"
        @click="() => setTab(key)"
      >
        {{ name }}
      </div>
    </div>

    <div
      class="w-[370px] h-[340px] mx-2
        p-2 overflow-hidden
        border border-[var(--el-border-color)]
        bg-[var(--el-bg-color)]"
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
    </div>

    <div class="flex justify-end p-2">
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
    </div>
  </div>
</template>

<style scoped>
.tabs {
  translate: 0 1px;
}

.tab-item {
  border-width: 1px 1px 1px 0;
  border-style: solid;
  border-color: var(--el-border-color);
  padding: 4px 8px;
  background: var(--el-fill-color);
  margin-top: 2px;
  user-select: none;

  &:first-of-type {
    border-left-width: 1px;
  }

  &.actived {
    background: var(--el-bg-color);
    border-bottom-color: transparent;
    margin-top: 0px;
  }

  &:not(.actived):hover {
    background: var(--el-bg-color);
  }
}
</style>
