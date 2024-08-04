<script setup lang="ts" generic="T">
import type { ModifierConstructorOptions } from '..'
import type { EnumModifierProps } from '../modifiers'

defineProps<{
  options: ModifierConstructorOptions<EnumModifierProps<T>>
}>()

const modelValue = defineModel<Required<API.TweakConfigVo>['meta']>('modelValue', {
  required: true,
  default: {},
})

const enumValue = computed<T>({
  get: () => {
    return modelValue.value.value as T
  },
  set: (value) => {
    modelValue.value = {
      ...modelValue.value,
      value,
    }
  },
})
</script>

<template>
  <el-select-v2 v-model="enumValue" :options="options.options" />
</template>
