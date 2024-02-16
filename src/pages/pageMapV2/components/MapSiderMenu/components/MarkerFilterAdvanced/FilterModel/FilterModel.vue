<script lang="ts" setup>
import type { Component } from 'vue'
import {
  ModelContentContain,
  ModelContentRegex,
  ModelIdRange,
  ModelImage,
  ModelTitleContain,
  ModelUnderground,
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
    1: ModelIdRange,
    2: ModelTitleContain,
    3: ModelContentContain,
    4: ModelContentRegex,
    5: ModelUnderground,
    7: ModelImage,
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
