<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import type { TypeManager, TypeObject } from '../config'
import { ItemTypeManager } from '../definitions'
import { type ElFormType, HIDDEN_FLAG_OPTIONS } from '@/shared'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { AppRowImage } from '@/components'
import { useAccessStore, useIconTagStore } from '@/stores'

defineProps<{
  parent?: TypeObject
  manager: TypeManager<TypeObject>
}>()

const accessStore = useAccessStore()
const iconTagStore = useIconTagStore()

const formRef = ref<ElFormType | null>(null)

const modelValue = defineModel<TypeObject>('modelValue', {
  required: true,
})

const tagOptions = ref<(API.TagVo & { label: string; value: string })[]>([])
const { loading, refresh: getTagList, onSuccess } = useFetchHook({
  immediate: true,
  onRequest: (query: string) => db.iconTag.filter(tag => !query ? true : (tag.tag?.includes(query) ?? false)).toArray(),
})
onSuccess((tagList) => {
  tagOptions.value = tagList.map(tag => ({
    label: tag.tag!,
    value: tag.tag!,
    ...tag,
  }))
})

const rules: FormRules = {
  name: [{ required: true, message: '名称不能为空', validator: (_, v = '') => v.length > 0 }],
}

const name = computed({
  get: () => modelValue.value.name ?? '',
  set: (v) => {
    modelValue.value.name = v.replaceAll(/\s+/g, '')
  },
})

const sortIndex = computed({
  get: () => modelValue.value.sortIndex,
  set: (v) => {
    const sortNumber = Number(v)
    if (!Number.isInteger(sortNumber))
      return
    modelValue.value.sortIndex = sortNumber
  },
})

defineExpose({
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <el-form ref="formRef" class="w-[300px]" label-width="80px" :model="modelValue" :rules="rules">
    <el-form-item label="父级分类">
      {{ parent ? parent.name : '全部' }}
    </el-form-item>

    <el-form-item label="类型名称" prop="name">
      <el-input v-model="name" />
    </el-form-item>

    <el-form-item v-if="(manager instanceof ItemTypeManager)" label="排序" prop="sortIndex">
      <el-input-number v-model="sortIndex" :min="0" :step="1" style="width: 100%" />
    </el-form-item>

    <el-form-item v-if="(manager instanceof ItemTypeManager)" label="描述" prop="content">
      <el-input v-model="modelValue.content" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item v-if="(manager instanceof ItemTypeManager)" label="图标" prop="iconTag">
      <div class="w-full grid grid-cols-[32px,1fr] gap-2">
        <AppRowImage :src="iconTagStore.iconTagMap[modelValue.iconTag ?? '']?.url" />
        <el-select-v2
          v-model="modelValue.iconTag"
          filterable
          remote
          clearable
          placeholder="搜索标签名称"
          :remote-method="getTagList"
          :loading="loading"
          :options="tagOptions"
        >
          <template #default="{ item }">
            <div class="flex items-center gap-2">
              <img :src="item.url" class="w-6 h-6 object-contain" crossorigin="" loading="lazy">
              <span>{{ item.label }}</span>
            </div>
          </template>
        </el-select-v2>
      </div>
    </el-form-item>

    <el-form-item v-if="(manager instanceof ItemTypeManager)" label="可见性" prop="hiddenFlag">
      <el-select-v2
        v-model="modelValue.hiddenFlag"
        :options="HIDDEN_FLAG_OPTIONS"
        :disabled="!accessStore.get('MANAGER_COMPONENT')"
      />
    </el-form-item>
  </el-form>
</template>
