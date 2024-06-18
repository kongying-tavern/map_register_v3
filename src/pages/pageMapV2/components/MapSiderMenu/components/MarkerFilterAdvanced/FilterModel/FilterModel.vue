<script lang="ts" setup>
import type { Component } from 'vue'
import {
  ModelArea,
  ModelContentContain,
  ModelContentRegex,
  ModelIdRange,
  ModelImage,
  ModelItemCount,
  ModelItemName,
  ModelItemNameRegex,
  ModelItemSize,
  ModelItemType,
  ModelLinkage,
  ModelRefreshTime,
  ModelTitleContain,
  ModelUnderground,
  ModelUndergroundLayer,
  ModelVideo,
  ModelVisibility,
} from '.'
import type { MAFItemComposed, MAFValue } from '@/stores/types'

const props = defineProps<{
  composedCondition: MAFItemComposed
}>()

const modelValue = defineModel<MAFValue>('modelValue', {
  required: false,
  default: {},
})

const modelTemplate = computed(() => {
  return {
    1: ModelIdRange,
    2: ModelTitleContain,
    3: ModelContentContain,
    4: ModelContentRegex,
    5: ModelUnderground,
    6: ModelUndergroundLayer,
    7: ModelImage,
    8: ModelVideo,
    9: ModelLinkage,
    10: ModelRefreshTime,
    11: ModelVisibility,
    101: ModelArea,
    102: ModelItemType,
    103: ModelItemName,
    104: ModelItemNameRegex,
    105: ModelItemSize,
    106: ModelItemCount,
  }[props.composedCondition.id]
}) as ComputedRef<Component>
</script>

<template>
  <component
    :is="modelTemplate"
    v-if="modelTemplate"
    v-model="modelValue"
    :options="composedCondition.option"
    :meta="composedCondition.meta"
  />
</template>
