<script lang="ts" setup>
import type { Component } from 'vue'
import {
  ContentContain,
  ContentRegex,
  IdRange,
  TitleContain,
} from '.'
import { useMapStateStore } from '@/stores'
import type { MAFItem, MAFOption, MAFValue } from '@/stores/types'

const props = defineProps<{
  condition: MAFItem
}>()

const { getMAFConfig } = useMapStateStore()

const model = computed(() => getMAFConfig(props.condition.id))

const modelTemplate = computed(() => {
  return {
    1: IdRange,
    2: TitleContain,
    3: ContentContain,
    4: ContentRegex,
  }[props.condition.id]
}) as ComputedRef<Component>

const modelOptions = computed<MAFOption>(() => model.value.option)

const modelValue = defineModel<MAFValue>('modelValue', {
  required: false,
  default: {},
  type: Object,
})
</script>

<template>
  <component
    :is="modelTemplate"
    v-if="modelTemplate"
    v-model="modelValue"
    :options="modelOptions"
  />
</template>
