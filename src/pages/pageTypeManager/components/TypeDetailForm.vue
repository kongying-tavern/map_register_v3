<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import type { TypeManager, TypeObject } from '../config'
import { ItemTypeManager } from '../definitions'
import type { ElFormType } from '@/shared'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { AppRowImage } from '@/components'
import { useIconTagStore } from '@/stores'

const props = defineProps<{
  modelValue: TypeObject
  parent?: TypeObject
  manager: TypeManager<TypeObject>
}>()

defineEmits<{
  'update:modelValue': [TypeObject]
}>()

const formRef = ref<ElFormType | null>(null)

const iconTagStore = useIconTagStore()

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

const form = toRef(props, 'modelValue')

const name = computed({
  get: () => props.modelValue.name ?? '',
  set: (v) => {
    form.value.name = v.replaceAll(/\s+/g, '')
  },
})

const sortIndex = computed({
  get: () => props.modelValue.sortIndex,
  set: (v) => {
    const sortNumber = Number(v)
    if (!Number.isInteger(sortNumber))
      return
    form.value.sortIndex = sortNumber
  },
})

defineExpose({
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <el-form ref="formRef" label-width="80px" :model="modelValue" :rules="rules">
    <el-form-item label="父级分类">
      {{ parent ? parent.name : '根分类' }}
    </el-form-item>

    <el-form-item label="类型名称" prop="name">
      <el-input v-model="name" />
    </el-form-item>

    <el-form-item label="排序" prop="sortIndex">
      <el-input v-model="sortIndex" />
    </el-form-item>

    <el-form-item v-if="(manager instanceof ItemTypeManager)" label="补充说明" prop="content">
      <el-input v-model="form.content" type="textarea" :rows="3" />
    </el-form-item>

    <el-form-item v-if="(manager instanceof ItemTypeManager)" label="图标" prop="iconTag">
      <div class="grid gap-2" style="grid-template-columns: 32px 1fr;">
        <AppRowImage :src="iconTagStore.iconTagMap[form.iconTag ?? '']?.url" />
        <el-select-v2
          v-model="form.iconTag"
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
  </el-form>
</template>
