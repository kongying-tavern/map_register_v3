<script lang="ts" setup>
import { Right } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash'
import { useIconTypeList, useImageCut } from '../hooks'
import { IconImageEditor } from '.'
import { requireCheck } from '@/utils'
import type { ElFormType } from '@/shared'
import type { ItemFormRules } from '@/utils'

const props = defineProps<{
  modelValue: API.IconVo
}>()

const emits = defineEmits<{
  'update:modelValue': [form: API.IconVo]
}>()

// ==================== 表单数据 ====================
const formData = ref(cloneDeep(props.modelValue))

// ==================== 图标类型 ====================
const { iconTreeSelectProps, lazyLoadNode } = useIconTypeList()

// ==================== 图标编辑 ====================
const rawIconUrl = computed({
  get: () => decodeURIComponent(formData.value.url ?? ''),
  set: (v) => { formData.value.url = v },
})

/** 缓存的原始图标 */
const cachedRawIconUrl = ref(props.modelValue.url)

/** 编辑后的图标 */
const changedIconUrl = ref(props.modelValue.url)
const handleInputBlur = () => {
  changedIconUrl.value = formData.value.url ?? ''
}

/** 图标编辑类型，使用编辑器或者手动输入地址 */
const isIconEditorType = ref(true)

const { uploaderRef, uploadImage, uploadImageUrl, cutImageFile, cutImageUrl, setCutImage, handleImageChange, uploadIcon } = useImageCut()

const getIconUrl = async () => {
  if (!isIconEditorType.value || !cutImageFile.value) {
    formData.value.url = changedIconUrl.value
    return changedIconUrl.value
  }
  const file = new File([cutImageFile.value], `${crypto.randomUUID()}.png`, { type: 'image/png', lastModified: Date.now() })
  await uploadIcon(file)
  if (!uploadImageUrl.value)
    throw new Error('图片上传失败，图床服务可能失效，请联系开发人员。')
  formData.value.url = uploadImageUrl.value
}

// ==================== 表单校验 ====================
const formRef = ref<ElFormType | null>(null)

const rules: ItemFormRules<API.IconVo> = {
  name: [requireCheck('change', '图标名称')],
  url: [{
    required: true,
    message: () => isIconEditorType.value ? '选择一个图片文件' : '图标地址不符合url格式',
    validator: (_, img: string | Blob) => {
      return typeof img === 'string' ? /^http(s):\/\/\S+$/.test(img) : Boolean(cutImageFile.value)
    },
  }],
}

defineExpose({
  // 由于依赖一个缓存系统去显示新旧图标的差异，为了避免外部频繁请求可能未填写完的图片地址
  // 这里选择暴露一个手动数据同步方法
  syncData: () => emits('update:modelValue', formData.value),
  validate: () => formRef.value?.validate(),
  getIconUrl,
})
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
    <el-form-item label="图标名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入图标名称" />
    </el-form-item>

    <el-form-item label="图标类型" prop="typeIdList">
      <el-tree-select
        v-model="formData.typeIdList"
        placeholder="请选择图标类型"
        lazy
        multiple
        collapse-tags
        collapse-tags-tooltip
        :load="lazyLoadNode"
        :props="iconTreeSelectProps"
      />
    </el-form-item>

    <el-form-item prop="url">
      <template #label>
        <el-button @click="isIconEditorType = !isIconEditorType">
          {{ isIconEditorType ? '图标文件' : '图标地址' }}
        </el-button>
      </template>

      <el-upload
        v-if="isIconEditorType"
        ref="uploaderRef"
        drag
        class="w-full"
        accept="image/*"
        style="color: var(--el-text-color-placeholder);"
        :auto-upload="false"
        @change="handleImageChange"
      >
        拖放或选择图片
      </el-upload>

      <el-input
        v-else
        v-model="rawIconUrl"
        type="textarea"
        :rows="5"
        resize="none"
        placeholder="请输入图标地址"
        style="height: 124px;"
        @blur="handleInputBlur"
      />
    </el-form-item>

    <el-form-item label="图标预览">
      <div class="w-full h-16 flex justify-between items-center">
        <img
          v-if="cachedRawIconUrl"
          class="w-16 aspect-square rounded border object-cover"
          style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
          :src="cachedRawIconUrl"
          crossorigin=""
        >
        <template v-if="(!isIconEditorType && changedIconUrl) || (isIconEditorType && cutImageUrl)">
          <el-icon v-if="formData.id" :size="24">
            <Right />
          </el-icon>
          <img
            class="w-16 aspect-square rounded border object-cover"
            style="background-color: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-8);"
            :src="isIconEditorType ? cutImageUrl : changedIconUrl"
            crossorigin=""
          >
        </template>
      </div>
    </el-form-item>

    <IconImageEditor v-model="uploadImage" @cut-image="setCutImage" />
  </el-form>
</template>
