<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { IconRenderer, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useIconType } from '@/hooks'
import { useIconFormRules, useIconUpdate } from '../hooks'
import { ImageCropper } from './ImageCropper'

const props = defineProps<{
  icon: API.IconVo
}>()

const emits = defineEmits<{
  close: []
}>()

/** 绑定表单 */
const iconForm = ref<API.IconVo>(JSON.parse(JSON.stringify(props.icon)))

/** 是否启用图像编辑 */
const iconEditable = ref(false)

/** 图标变体 */
const variant = ref('default')

const withVariantState = (label: string, name: string) => {
  const { urlVariants = {} } = iconForm.value
  if (!urlVariants[name])
    return `${label} (未配置)`
  return label
}

const getVariantUrl = (name: string) => {
  const { urlVariants = {} } = iconForm.value
  return urlVariants[name]
}

const variantTabs = [
  { label: '默认', name: 'default', required: true },
  { label: '已激活', name: 'inactive', required: false },
  { label: '未激活', name: 'active', required: false },
] as const

/** 更新逻辑封装 */
const {
  isChanged,
  loading,
  onSuccess,
  stashIcon,
  clearStash,
  updateIcon,
} = useIconUpdate(iconForm, {
  iconEditable,
})

/** 图标类型 */
const { props: typeTreeProps, load: loadIconType } = useIconType()

/** 校验规则 */
const { rules } = useIconFormRules(iconForm)

/** 确认按钮可用性 */
const disabledConfirm = computed(() => {
  const { tag = '' } = iconForm.value
  if (!tag.trim().length)
    return true
  if ([
    props.icon.tag === iconForm.value.tag,
    props.icon.description === iconForm.value.description,
    JSON.stringify(props.icon.typeIdList ?? []) === JSON.stringify(iconForm.value.typeIdList ?? []),
    !iconEditable.value || (iconEditable.value && !isChanged.value),
  ].every(Boolean)) {
    return true
  }
  return false
})

onSuccess(() => {
  emits('close')
})

/** 记录图标变更情况 */
const handleImageLoad = (_: ImageBitmap, __: Blob, isRaw: boolean, canvas: HTMLCanvasElement) => {
  if (isRaw) {
    clearStash()
    return
  }
  stashIcon(canvas)
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
      <el-tag size="small" type="warning">
        ID: {{ props.icon.id }}
      </el-tag>
      <div>
        {{ props.icon.tag }}
      </div>
    </WinDialogTitleBar>

    <WinDialogTabPanel class="w-[384px] mb-0 flex flex-col">
      <div class="w-full shrink-0 overflow-hidden flex">
        <div
          class="shrink-0 h-fit relative toggle-cropper border border-[var(--el-border-color)] rounded overflow-hidden"
          :class="{
            'is-editting': iconEditable,
          }"
        >
          <IconRenderer
            class="w-[120px] h-[120px]"
            :icon-id="props.icon.id"
            @click="iconEditable = !iconEditable"
          />
        </div>

        <el-form
          :disabled="loading"
          :rules="rules"
          :model="iconForm"
          label-width="60px"
          class="flex-1"
        >
          <el-form-item label="名称" prop="tag" style="margin-bottom: 17px;">
            <el-input v-model="iconForm.tag" />
          </el-form-item>

          <el-form-item label="描述" prop="description" style="margin-bottom: 8px;">
            <el-input v-model="iconForm.description" :rows="3" resize="none" type="textarea" />
          </el-form-item>

          <el-form-item label="分类" prop="typeIdList" style="margin-bottom: 0;">
            <el-tree-select
              v-model="iconForm.typeIdList"
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

      <div
        class="transition-[height] overflow-visible"
        :class="iconEditable ? 'h-[336px]' : 'h-0'"
      >
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
              :type="tab.name"
              class="w-full flex-1"
              @image-load="handleImageLoad"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </WinDialogTabPanel>

    <WinDialogFooter class="items-center">
      <div class="flex-1">
        <el-tag v-if="iconEditable && isChanged" disable-transitions type="success">
          将会更新图片
        </el-tag>
      </div>
      <el-button
        type="primary"
        :icon="Check"
        :disabled="disabledConfirm"
        :loading="loading"
        @click="updateIcon"
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
.toggle-cropper {
  --content: '编辑图片';
  --bg: var(--el-color-primary);
  --bg-alpha: 0%;
  --text-alpha: 0%;

  cursor: pointer;

  &::before {
    content: var(--content);
    border-radius: 4px;
    display: grid;
    place-content: center;
    color: color-mix(in srgb, var(--el-color-white) var(--text-alpha), transparent calc(100% - var(--text-alpha)));
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: var(--alpha);
    background-color: color-mix(in srgb, var(--bg) var(--bg-alpha), transparent calc(100% - var(--bg-alpha)));
    z-index: 1;
    pointer-events: none;
  }

  &:hover {
    --text-alpha: 100%;
    --bg-alpha: 50%;
  }
  &:active {
    --bg-alpha: 30%;
  }

  &.is-editting {
    --bg: var(--el-color-warning);
    --content: '取消编辑';
    border-color: var(--el-color-warning);
  }
}

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
