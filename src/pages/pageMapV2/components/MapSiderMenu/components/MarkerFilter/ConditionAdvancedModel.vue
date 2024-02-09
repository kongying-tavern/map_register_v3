<script lang="ts" setup>
import type { Component } from 'vue'
import { useMarkerAdvancedFilterModel } from './MarkerAdvancedFilterModel'
import type { ConditionAdvancedItem } from '@/stores/types'

const props = defineProps<{
  condition: ConditionAdvancedItem
}>()

const model = computed(() => useMarkerAdvancedFilterModel(props.condition.id))

const modelTemplate: Component = computed(() => model.value.template)
</script>

<template>
  <component :is="modelTemplate" v-if="modelTemplate" />
</template>
