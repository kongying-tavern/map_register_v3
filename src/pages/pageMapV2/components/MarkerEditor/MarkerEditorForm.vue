<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { cloneDeep } from 'lodash'
import { addonPanelRefKey } from './shared'
import {
  AddonContenEditor,
  AddonExtraEditor,
  AddonHistory,
  AddonImageEditor,
  AddonItem,
  AddonRefreshtimeEditor,
} from './components'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { useAccessStore, useMarkerExtraStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { HiddenFlagEnum } from '@/shared'
import { isTreasureChestMatched, requireCheck } from '@/utils'

const props = defineProps<{
  modelValue: API.MarkerVo
  initAreaCode?: string
  loading?: boolean
}>()

const emits = defineEmits<{
  'update:modelValue': [API.MarkerVo]
  'close': []
}>()

/** 用户权限 */
const accessStore = useAccessStore()

/** 表单数据 */
const form = ref<API.MarkerVo & { areaCode: string }>({
  ...cloneDeep(props.modelValue),
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

/** 表单校验规则 */
const rules: FormRules = {
  areaCode: [requireCheck('change', '所属地区')],
  markerTitle: [requireCheck('change', '标题')],
  hiddenFlag: [requireCheck('change', '点位标识')],
  itemList: [
    {
      required: true,
      validator: (_, items: API.MarkerItemLinkVo[] = []) => (form.value.itemList ??= items).length > 0,
      message: '至少需要选择一项物品',
      trigger: 'change',
    },
    {
      validator: (_, items: API.MarkerItemLinkVo[] = []) => items.every(({ count = 0 }) => !Number.isNaN(count)),
      message: '必须是一个合法的数字',
      trigger: 'change',
    },
    isTreasureChestMatched(),
  ],
  videoPath: [{
    validator: (_, value = '') => {
      form.value.videoPath = value.trim()
      return !form.value.videoPath || /^https:\/\/www.bilibili.com\/video\/BV[a-zA-Z0-9]+/.test(form.value.videoPath)
    },
    message: '视频链接不正确(需要B站链接)',
    trigger: 'blur',
  }],
}

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

const isExtraEditable = computed(() => Object.keys(availableExtraConfig.value).length > 0)

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
          </el-form-item>

          <el-form-item v-if="isExtraEditable" label="点位层级" prop="extra">
            <AddonExtraEditor v-model="form.extra" :area-code="form.areaCode" :extra-config="availableExtraConfig" />
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
