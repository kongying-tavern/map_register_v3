<script lang="ts" setup>
import type { IconVariant } from '../types'
import { Check, Close } from '@element-plus/icons-vue'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useIconType } from '@/hooks'
import { useIconCreate, useIconFormRules } from '../hooks'
import { ImageCropper } from './ImageCropper'

const emits = defineEmits<{
  close: []
  success: []
}>()

/** 绑定表单 */
const form = ref<API.IconVo>({})

/** 图标变体 */
const variant = ref('default')

const variantTabs = [
  { label: '默认', name: 'default', required: true },
  { label: '已激活', name: 'inactive', required: false },
  { label: '未激活', name: 'active', required: false },
] as const

/** 更新逻辑封装 */
const {
  stash,
  loading,
  onSuccess,
  stashIcon,
  createIcon,
  clearStash,
} = useIconCreate(form)

const withVariantState = (label: string, name: string) => {
  const { urlVariants = {} } = form.value
  if (stash.value[name])
    return `${label} (待上传)`
  if (!urlVariants[name])
    return `${label} (未配置)`
  return label
}

const getVariantUrl = (name: string) => {
  const { urlVariants = {} } = form.value
  return urlVariants[name]
}

/** 图标类型 */
const {
  props: typeTreeProps,
  load: loadIconType,
} = useIconType()

/** 校验规则 */
const { rules } = useIconFormRules(form)

/** 确认按钮可用性 */
const disabledConfirm = computed(() => {
  const { tag = '' } = form.value
  if (!tag.trim().length)
    return true
  return Object.keys(stash.value).length === 0
})

onSuccess(() => {
  emits('close')
  emits('success')
})

/** 记录图标变更情况 */
const handleImageLoad = ({ canvas, isRaw, variant }: {
  canvas: HTMLCanvasElement
  isRaw: boolean
  variant: IconVariant
}) => {
  if (isRaw) {
    clearStash(variant)
    return
  }
  stashIcon(variant, canvas)
}

const handleIconVariantDelete = (variant: IconVariant) => {
  if (!form.value.urlVariants)
    form.value.urlVariants = {}
  form.value.urlVariants[variant] = null as unknown as string
}

const cancel = () => {
  emits('close')
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar
      class="gap-2"
      :disabled="loading"
      @close="cancel"
    >
      新建图标
    </WinDialogTitleBar>

    <WinDialogTabPanel class="w-[384px] mb-0 flex flex-col">
      <div class="w-full shrink-0 overflow-hidden flex">
        <el-form
          :rules="rules"
          :disabled="loading"
          :model="form"
          label-width="60px"
          class="flex-1"
        >
          <el-form-item label="名称" prop="tag" style="margin-bottom: 16px">
            <el-input v-model="form.tag" />
          </el-form-item>

          <el-form-item label="描述" prop="description" style="margin-bottom: 8px">
            <el-input v-model="form.description" :rows="3" resize="none" type="textarea" />
          </el-form-item>

          <el-form-item label="类型" prop="typeIdList" style="margin-bottom: 0">
            <el-tree-select
              v-model="form.typeIdList"
              lazy
              multiple
              collapse-tags
              collapse-tags-tooltip
              :load="loadIconType"
              :props="typeTreeProps"
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="h-[336px] overflow-visible transition-all">
        <el-divider style="margin: 8px 0" />
        <el-tabs
          v-model="variant"
          class="custom-tabs"
          type="border-card"
        >
          <el-tab-pane
            v-for="tab in variantTabs"
            :key="tab.name"
            :name="tab.name"
            :label="withVariantState(tab.label, tab.name)"
          >
            <ImageCropper
              :raw="getVariantUrl(tab.name)"
              :variant="tab.name"
              class="w-full flex-1"
              @image-load="handleImageLoad"
              @delete="handleIconVariantDelete"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </WinDialogTabPanel>

    <WinDialogFooter class="items-center">
      <el-button
        type="primary"
        :icon="Check"
        :disabled="disabledConfirm"
        :loading="loading"
        @click="createIcon"
      >
        确认
      </el-button>
      <el-button
        :icon="Close"
        :disabled="loading"
        @click="cancel"
      >
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>

<style scoped>
.custom-tabs {
  --el-tabs-header-height: 30px;

  :deep(.el-tabs__item.el-tabs__item.el-tabs__item) {
    padding-left: 8px;
    padding-right: 8px;
  }
  :deep(.el-tabs__header.is-top) {
    margin-bottom: 0;
  }
  :deep(.el-tabs__item) {
    font-size: 12px;
    transition: none;
  }
  :deep(.el-tabs__content) {
    padding: 4px;
    flex: 1;
  }
  :deep(.el-tab-pane) {
    display: flex;
    flex-direction: column;
  }
}
</style>
