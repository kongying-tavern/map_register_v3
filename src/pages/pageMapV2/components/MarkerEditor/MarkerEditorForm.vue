<script lang="ts" setup>
import { addonPanelRefKey } from './shared'
import {
  AddonContenEditor,
  AddonExtra,
  AddonHistory,
  AddonImageEditor,
  AddonItem,
  AddonRefreshtimeEditor,
} from './components'
import { useRules } from './validators'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useAccessStore, useItemStore, useMarkerExtraStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { HiddenFlagEnum, specialMask } from '@/shared'

const props = defineProps<{
  modelValue: API.MarkerVo
  initAreaCode?: string
  loading?: boolean
}>()

const emits = defineEmits<{
  'update:modelValue': [API.MarkerVo]
  'close': []
}>()

const itemStore = useItemStore()
const accessStore = useAccessStore()

/** 表单数据 */
const form = ref<API.MarkerVo & { areaCode: string }>({
  ...props.modelValue,
  picture: props.modelValue.picture ?? '',
  extra: props.modelValue.extra ?? {},
  areaCode: props.initAreaCode ?? '',
})

watch(form, () => {
  if (props.loading)
    return
  emits('update:modelValue', form.value)
}, { deep: true })

const handleUsingHistory = (history: API.MarkerVo) => {
  Object.assign(form.value, history)
}

const { rules } = useRules()

/**
 * 右侧额外面板识别 id
 * @default 默认展开点位描述
 */
const addonId = ref('content')

/** 表单实例 */
const formRef = ref<ElFormType>()

// ==================== 点位 extra ====================
const markerExtraStore = useMarkerExtraStore()

const availableExtraConfig = computed(() => {
  if (!form.value.areaCode)
    return {}
  return markerExtraStore.mergedAreaExtraConfigs[form.value.areaCode] ?? {}
})

/**
 * 判断是否可被设置图标覆盖（检测所属物品是否存在 special 掩码第二位为 1）
 * @see `src\shared\specialFlag.ts`
 */
const isIconOverridable = computed(() => toValue(form).itemList?.find(({ itemId }) => {
  const item = itemStore.itemIdMap.get(itemId!)
  if (!item)
    return false
  return specialMask.isActive(item.specialFlag ?? 0, 'isIconCustomizable')
}) !== undefined)

const isExtraEditable = computed(() => {
  return toValue(isIconOverridable) || Object.keys(availableExtraConfig.value).length > 0
})

// ==================== 拓展面板 ====================
const addonPanelRef = ref<HTMLDivElement>()
provide(addonPanelRefKey, addonPanelRef)

const addonPanelVisible = ref(true)
const onAddonPanelTransitionStart = (ev: TransitionEvent) => {
  if (ev.propertyName === 'width')
    addonPanelVisible.value = false
}
const onAddonPanelTransitionEnd = (ev: TransitionEvent) => {
  if (ev.propertyName === 'width')
    addonPanelVisible.value = true
}

// ==================== 面板样式 ====================
const themeColor = computed(() => {
  const { areaCode = '' } = form.value
  const zone = areaCode.split(':')[1]
  if (!zone)
    return '#409eff'
  return `var(--gs-color-${zone.toLowerCase()})`
})

defineExpose({
  validate: async () => await formRef.value?.validate().catch(() => false),
})
</script>

<template>
  <WinDialog
    :style="{
      'border-color': `color-mix(in srgb, var(--el-color-primary-light-9) 50%, ${themeColor} 50%)`,
    }"
  >
    <WinDialogTitleBar
      :style="{
        background: `color-mix(in srgb, var(--el-bg-color) 50%, ${themeColor} 50%)`,
      }"
      :loading="loading"
      @close="() => emits('close')"
    >
      {{ form.id === undefined ? '添加点位' : `(id: ${form.id}) ${form.markerTitle}` }}
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <div class="marker-editor-form grid h-full rounded-lg">
        <el-form ref="formRef" :rules="rules" :model="form" class="form-content w-96" label-width="80px">
          <el-form-item label="点位名称" prop="markerTitle">
            <div class="w-full flex justify-between gap-1">
              <el-input v-model="form.markerTitle" />
              <AddonHistory
                v-if="form.id !== undefined"
                v-model:addon-id="addonId"
                v-model:marker-vo="form"
                :loading="loading"
                @use-history="handleUsingHistory"
              />
            </div>
          </el-form-item>

          <el-form-item label="所属物品" prop="itemList">
            <AddonItem
              v-model="form"
              v-model:addon-id="addonId"
            />
            <template #error="{ error }">
              <div
                class="absolute -bottom-[18px] h-[18px] text-xs text-[var(--el-color-danger)] z-10"
                :title="error"
              >
                {{ error }}
              </div>
            </template>
          </el-form-item>

          <el-form-item v-if="isExtraEditable" label="附加信息" prop="extra">
            <AddonExtra
              v-model="form.extra"
              v-model:addon-id="addonId"
              :config="availableExtraConfig"
              :item-list="form.itemList"
              :is-icon-overridable="isIconOverridable"
            />
          </el-form-item>

          <el-form-item label="点位描述" prop="content">
            <AddonContenEditor v-model="form.content" v-model:addon-id="addonId" :item-list="form.itemList" />
          </el-form-item>

          <el-form-item label="点位图像" prop="picture">
            <AddonImageEditor v-model="form.picture" v-model:addon-id="addonId" />
          </el-form-item>

          <el-form-item label="显示状态" prop="hiddenFlag">
            <el-radio-group v-model="form.hiddenFlag">
              <el-radio-button :value="HiddenFlagEnum.SHOW">
                显示
              </el-radio-button>
              <el-radio-button :value="HiddenFlagEnum.HIDDEN">
                隐藏
              </el-radio-button>
              <el-radio-button v-if="accessStore.get('HIDDEN_FLAG_HIDDEN')" :value="HiddenFlagEnum.NEIGUI">
                测试服点位
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="刷新时间" prop="refreshTime">
            <AddonRefreshtimeEditor v-model="form.refreshTime" />
          </el-form-item>

          <el-form-item label="视频链接" prop="videoPath">
            <el-input v-model="form.videoPath" />
          </el-form-item>
        </el-form>

        <div
          class="addon-panel"
          :class="{ visible: addonId }"
          @transitionstart="onAddonPanelTransitionStart"
          @transitionend="onAddonPanelTransitionEnd"
        >
          <div v-show="addonPanelVisible" ref="addonPanelRef" class="addon-panel-content" />
        </div>
      </div>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <slot name="footer" />
    </WinDialogFooter>
  </WinDialog>
</template>

<style scoped>
.marker-editor-form {
  grid-template-columns: 1fr auto;
}

.addon-panel {
  --padding-left: 16px;

  width: 0;
  height: 100%;
  padding-left: 0;
  transition: var(--el-transition-all);
  overflow: hidden;
  position: relative;

  &.visible {
    width: 400px;
    padding-left: var(--padding-left);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    translate: calc(var(--padding-left) / 2) 0;
    border-left: 1px solid var(--el-border-color);
  }
}

.addon-panel-content {
  position: absolute;
  top: 0;
  height: 100%;
  width: calc(100% - var(--padding-left));
}
</style>
