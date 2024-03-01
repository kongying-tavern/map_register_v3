<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { useTagOptions } from '../hooks'
import type { ElFormType } from '@/shared'
import { HiddenFlagEnum } from '@/shared'
import type { ItemFormRules } from '@/utils'
import { AppIconTagRenderer, AppItemSelecter } from '@/components'
import { useIconTagStore } from '@/stores'

const props = defineProps<{
  parent?: API.AreaVo
  items?: API.ItemVo[]
  modelValue: API.AreaVo
}>()

const emits = defineEmits<{
  'update:modelValue': [area: API.AreaVo]
  'update:items': [items?: API.ItemVo[]]
}>()

const formData = ref(cloneDeep(props.modelValue))

const isInternalUpdate = ref(false)

watch(() => props.modelValue, (data) => {
  if (isInternalUpdate.value) {
    isInternalUpdate.value = false
    return
  }
  formData.value = cloneDeep(data)
}, { deep: true })

watch(formData, (form) => {
  isInternalUpdate.value = true
  emits('update:modelValue', form)
}, {
  deep: true,
})

const areaCode = computed({
  get: () => {
    const [_, areaTag, areaZone] = formData.value.code?.split(':') ?? []
    return props.parent ? areaZone : areaTag
  },
  set: (code) => {
    if (!code)
      formData.value.code = code
    const formatCode = code.toUpperCase()
    if (!/^[A-Z]+$/.test(formatCode))
      return
    formData.value.code = props.parent ? `A:${props.parent.code!.split(':')[1]}:${formatCode}` : `C:${formatCode}`
  },
})

const iconTagStore = useIconTagStore()

const { loading, tagOptions, getTagList } = useTagOptions()

const hiddenFlagOptions = [
  { label: '显示', value: HiddenFlagEnum.SHOW },
  { label: '隐藏', value: HiddenFlagEnum.HIDDEN },
  { label: '内鬼', value: HiddenFlagEnum.NEIGUI },
]

const selectedItems = computed({
  get: () => props.items,
  set: v => emits('update:items', v),
})

const rules: ItemFormRules<API.AreaVo> = {
  name: [
    { required: true, message: '地区名称不能为空' },
  ],
  code: [
    { required: true, message: '地区代码不能为空' },
  ],
}

const areaCodePrefix = computed(() => {
  if (!props.parent)
    return 'C:'
  const ParentAreaTag = props.parent.code!.split(':')[1]
  return `A:${ParentAreaTag}:`
})

const formRef = ref<ElFormType | null>(null)
defineExpose({
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <div class="flex">
    <el-form ref="formRef" label-width="80px" class="pr-2" :model="formData" :rules="rules">
      <el-form-item label="父级地区">
        {{ parent ? parent.name : '根地区' }}
      </el-form-item>

      <el-form-item label="地区名称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>

      <el-form-item label="地区代码" prop="code">
        <el-input v-model="areaCode">
          <template #prefix>
            {{ areaCodePrefix }}
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="地区描述" prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="3" resize="none" />
      </el-form-item>

      <el-form-item label="地区图标" prop="iconTag">
        <div class="w-full flex gap-2">
          <AppIconTagRenderer
            :src="iconTagStore.tagSpriteUrl"
            :mapping="iconTagStore.tagPositionMap[formData.iconTag ?? '']"
            class="w-8 h-8 flex-shrink-0"
          />
          <el-select-v2
            v-model="formData.iconTag"
            filterable
            remote
            clearable
            placeholder="搜索标签名称"
            popper-class="item-no-padding"
            :remote-method="getTagList"
            :loading="loading"
            :options="tagOptions"
            @clear="formData.iconTag = ''"
          >
            <template #default="{ item }">
              <div class="h-full flex justify-center items-center gap-1 overflow-hidden px-2" :title="item.label">
                <img :src="item.url" class="w-6 h-6 flex-shrink-0 object-contain" crossorigin="" loading="lazy">
                <span class="w-full overflow-hidden whitespace-nowrap text-ellipsis text-xs">{{ item.label }}</span>
              </div>
            </template>
          </el-select-v2>
        </div>
      </el-form-item>

      <el-form-item label="显示类型" prop="hiddenFlag">
        <el-select-v2 v-model="formData.hiddenFlag" :options="hiddenFlagOptions" style="width: 100%" />
      </el-form-item>

      <el-form-item label="地区排序" prop="sortIndex">
        <el-input-number v-model="formData.sortIndex" :min="0" :max="99" style="width: 100%" />
      </el-form-item>
    </el-form>

    <AppItemSelecter
      v-if="selectedItems !== undefined"
      v-model="selectedItems"
      title="复制以下物品"
      class="border-left pl-2 row-span-2"
      style="height: 400px"
    />
  </div>
</template>

<style scoped>
.el-border {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  transition: var(--el-transition-border);
  &:hover {
    border-color: var(--el-border-color-hover);
  }
}

.border-left {
  border-left: 1px solid var(--el-border-color);
}
</style>
