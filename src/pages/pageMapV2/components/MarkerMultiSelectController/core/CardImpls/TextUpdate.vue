<script setup lang="ts">
const modelValue = defineModel<Required<API.TweakConfigVo>['meta']>('modelValue', {
  required: true,
  default: {},
})

const text = computed<string>({
  get: () => {
    return `${modelValue.value.value ?? ''}`
  },
  set: (newText) => {
    modelValue.value = {
      ...modelValue.value,
      value: newText,
    }
  },
})
</script>

<template>
  <el-input v-model="text" placeholder="请输入文本..." clearable />
</template>
