<script lang="ts" setup>
import type { Component } from 'vue'
import { useMarkerAdvancedFilterModel } from './MarkerAdvancedFilterModel'
import type { ConditionAdvancedOpt, ConditionAdvancedVal } from './MarkerAdvancedFilterModel/types'
import type { ConditionAdvancedItem } from '@/stores/types'

const props = defineProps<{
  condition: ConditionAdvancedItem
}>()

const model = computed(() => useMarkerAdvancedFilterModel(props.condition.id))

const modelTemplate = computed<Component>(() => model.value.template)

const modelOptions = computed<ConditionAdvancedOpt>(() => model.value.option)

const modelValue = defineModel<ConditionAdvancedVal>('modelValue', {
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
