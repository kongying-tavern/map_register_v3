<script setup lang="ts">
import type { ModifierConstructorOptions } from '..'
import type { TextModifierProps } from '../modifiers'

defineProps<{
  options: ModifierConstructorOptions<TextModifierProps>
}>()

const modelValue = defineModel<Required<API.TweakConfigVo>['meta']>('modelValue', {
  required: true,
  default: {},
})

const searchText = computed({
  get: () => {
    return modelValue.value.test ?? ''
  },
  set: (test) => {
    modelValue.value = {
      ...modelValue.value,
      test,
    }
  },
})

const text = computed<string>({
  get: () => {
    return modelValue.value.replace ?? ''
  },
  set: (replace) => {
    modelValue.value = {
      ...modelValue.value,
      replace,
    }
  },
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <el-input v-model="searchText" placeholder="查找" clearable />
    <el-input
      v-model="text"
      placeholder="替换为"
      clearable
      :type="options.replaceMultiline ? 'textarea' : 'text'"
      :autosize="options.replaceMultiline ? { minRows: 2, maxRows: 4 } : false"
    />
  </div>
</template>
