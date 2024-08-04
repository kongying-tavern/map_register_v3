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

const text = computed<string>({
  get: () => {
    return `${modelValue.value.test ?? ''}`
  },
  set: (test) => {
    modelValue.value = {
      ...modelValue.value,
      test,
    }
  },
})
</script>

<template>
  <el-input
    v-model="text"
    placeholder="请输入文本..."
    clearable
    :type="options.allowMultiline ? 'textarea' : 'text'"
    :autosize="options.allowMultiline ? { minRows: 2, maxRows: 4 } : false"
  />
</template>
