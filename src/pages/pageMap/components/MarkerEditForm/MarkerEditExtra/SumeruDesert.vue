<script lang="ts" setup>
import { isArray } from 'lodash'

interface Palace {
  ug_name: string
  ug_level?: string[]
}

interface OptionsVo {
  label: string
  value: string
  children?: {
    label: string
    value: string
  }[]
}

const props = defineProps<{
  modelValue?: Palace
  options: OptionsVo[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v?: Palace): void
}>()

const data = ref<Palace>(props.modelValue ? props.modelValue : { ug_name: '无', ug_level: [] })
const options = ref<OptionsVo[]>(props.options)
// 千壑沙地
const ChildrenOptions = ref<{ label: string; value: string }[]>([])
const children = ref<boolean>(false)
const palaceChange = (val: string) => {
  const childrenO = options.value.find(e => e.value === val)?.children
  ChildrenOptions.value = isArray(childrenO) ? childrenO : []
  children.value = isArray(childrenO)
}
watch(data, () => {
  emit('update:modelValue', data.value)
}, { deep: true })
</script>

<template>
  <!-- 须弥 千壑沙地 -->
  <el-select
    v-model="data.ug_name"
    placeholder="选择"
    @change="palaceChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
  <el-select
    v-if="children"
    v-model="data.ug_level"
    placeholder="选择"
    multiple
  >
    <el-option
      v-for="item in ChildrenOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
