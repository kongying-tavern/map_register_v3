<script lang="ts" setup>
import type { AnnouncementSearchParams } from '../hooks'
import { channelsDict, getValidDict } from '../const/dictionary'

const props = defineProps<{
  modelValue: AnnouncementSearchParams
}>()

const emits = defineEmits<{
  'update:modelValue': [form: AnnouncementSearchParams]
}>()

const model = <K extends keyof AnnouncementSearchParams>(key: K) => computed({
  get: () => props.modelValue[key],
  set: v => emits('update:modelValue', { ...props.modelValue, [key]: v }),
})

const channels = model('channels')
const title = model('title')
const getValid = model('getValid') ?? true
</script>

<template>
  <el-form class="w-full" label-width="70px">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
      <el-form-item label="频道">
        <el-select-v2
          v-model="channels"
          placeholder="请选择点位类型"
          collapse-tags collapse-tags-tooltip clearable multiple
          style="width: 100%"
          :options="channelsDict"
        />
      </el-form-item>
      <el-form-item label="标题">
        <el-input
          v-model="title"
          placeholder="请输入标题"
          style="width: 100%" clearable
        />
      </el-form-item>
      <el-form-item label="是否有效">
        <el-select-v2
          v-model="getValid"
          placeholder="请选择是否有效"
          style="width: 100%"
          clearable
          :options="getValidDict"
        />
      </el-form-item>
      <el-form-item class="lg:col-start-4 lg:col-end-5 sm:col-start-2 sm:col-end-3 col-start-1 col-end-2">
        <slot name="footer" />
      </el-form-item>
    </div>
  </el-form>
</template>
