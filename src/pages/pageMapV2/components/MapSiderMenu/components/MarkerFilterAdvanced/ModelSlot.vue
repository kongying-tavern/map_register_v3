<script lang="ts" setup>
import type { Component } from 'vue'
import { useMarkerAdvancedFilterModel } from './FilterModel'
import type { MAFItem, MAFOption, MAFValue } from '@/stores/types'

const props = defineProps<{
  condition: MAFItem
}>()

const model = computed(() => useMarkerAdvancedFilterModel(props.condition.id))

const modelTemplate = computed<Component>(() => model.value.template)

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
