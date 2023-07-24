<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { cloneDeep } from 'lodash'
import {
  AddonContenEditor,
  AddonEditHistory,
  AddonExtraEditor,
  AddonImageEditor,
  AddonItemSelector,
  AddonRefreshtimeEditor,
} from '.'
import { useUserStore } from '@/stores'
import type { ElFormType } from '@/shared'
import { HiddenFlagEnum } from '@/shared'

const props = defineProps<{
  modelValue: API.MarkerVo
  initAreaCode?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerVo): void
}>()

/** 用户信息 */
const userStore = useUserStore()

/** 表单数据 */
const form = ref<API.MarkerVo>(cloneDeep(props.modelValue))

const areaCode = ref(props.initAreaCode ?? '')

watch(form, () => {
  emits('update:modelValue', form.value)
}, { deep: true })

/** 表单校验规则 */
const rules: FormRules = {
  markerTitle: [{
    required: true,
    validator: (_, value = '') => (form.value.markerTitle = value.trim()).length > 0,
    message: '标题不能为空（首尾空白字符会被去除）',
    trigger: 'blur',
  }],
  hiddenFlag: [{
    required: true,
    message: '点位标识不能为空',
    trigger: 'change',
  }],
  itemList: [{
    required: true,
    validator: (_, items: API.MarkerItemLinkVo[] = []) => (form.value.itemList ??= items).length > 0,
    message: '至少需要选择一项物品',
    trigger: 'change',
  }, {
    validator: (_, items: API.MarkerItemLinkVo[] = []) => items.every(({ count = 0 }) => count > 0),
    message: '物品数量不能为 0',
    trigger: 'change',
  }],
  videoPath: [{
    validator: (_, value = '') => {
      form.value.videoPath = value.trim()
      return !form.value.videoPath || /^https:\/\/www.bilibili.com\/video\/BV[a-zA-Z0-9]+/.test(form.value.videoPath)
    },
    message: '视频链接不正确(需要B站链接)',
    trigger: 'blur',
  }],
}

/** 右侧额外面板识别 id */
const addonId = ref('')

/** 表单实例 */
const formRef = ref<ElFormType | null>(null)
/** 图片编辑器实例 */
const imageEditorRef = ref<InstanceType<typeof AddonImageEditor> | null>(null)

const extraPanelRef = ref<HTMLElement | null>(null)
provide('extraPanel', extraPanelRef)

const extraVisible = ref(false)
const onExtraTransitionStart = (ev: TransitionEvent) => {
  if (ev.propertyName === 'width')
    extraVisible.value = false
}
const onExtraTransitionEnd = (ev: TransitionEvent) => {
  if (ev.propertyName === 'width')
    extraVisible.value = true
}

defineExpose({
  validate: async () => await formRef.value?.validate().catch(() => false),
  uploadPicture: async () => await imageEditorRef.value?.uploadPicture(),
})
</script>

<template>
  <div class="marker-editor-form grid p-4 h-full">
    <el-form ref="formRef" :rules="rules" :model="form" class="w-96" label-width="80px">
      <el-form-item label="点位名称" prop="markerTitle">
        <div class="w-full flex justify-between gap-1">
          <el-input v-model="form.markerTitle" />
          <AddonEditHistory v-if="form.id !== undefined" v-model:addon-id="addonId" v-model:marker-vo="form" />
        </div>
      </el-form-item>

      <el-form-item label="所属物品" prop="itemList">
        <AddonItemSelector v-model="form.itemList" v-model:addon-id="addonId" v-model:area-code="areaCode" />
      </el-form-item>

      <el-form-item v-if="areaCode" label="地下层级" prop="extra">
        <AddonExtraEditor v-model="form.extra" :area-code="areaCode" />
      </el-form-item>

      <el-form-item label="点位描述" prop="content">
        <AddonContenEditor v-model="form.content" v-model:addon-id="addonId" :item-list="form.itemList" />
      </el-form-item>

      <el-form-item label="点位图像" prop="picture">
        <AddonImageEditor
          ref="imageEditorRef"
          v-model="form.picture"
          v-model:addon-id="addonId"
          v-model:creator-id="form.pictureCreatorId"
        />
      </el-form-item>

      <el-form-item label="显示状态" prop="hiddenFlag">
        <el-radio-group v-model="form.hiddenFlag">
          <el-radio-button :label="HiddenFlagEnum.SHOW">
            显示
          </el-radio-button>
          <el-radio-button :label="HiddenFlagEnum.HIDDEN">
            隐藏
          </el-radio-button>
          <el-radio-button v-if="userStore.isAdmin || userStore.isNeigui" :label="HiddenFlagEnum.NEIGUI">
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

      <el-form-item v-if="$slots.footer" label-width="0" style="margin-bottom: 0;">
        <slot name="footer" />
      </el-form-item>
    </el-form>

    <div
      class="addon-panel"
      :class="{ visible: addonId }"
      @transitionstart="onExtraTransitionStart"
      @transitionend="onExtraTransitionEnd"
    >
      <div v-show="extraVisible" ref="extraPanelRef" class="addon-panel-content" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marker-editor-form {
  grid-template-columns: 1fr auto;
}

.addon-panel {
  width: 0;
  height: 100%;
  padding-left: 0;
  transition: var(--el-transition-all);
  overflow: hidden;
  position: relative;
  .addon-panel-content {
    position: absolute;
    top: 0;
    height: 100%;
    width: calc(100% - 1rem);
  }
  &.visible {
    width: 400px;
    padding-left: 1rem;
  }
}
</style>
