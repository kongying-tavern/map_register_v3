<script lang="ts" setup>
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
  ModelLinkageAction,
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
    5: ModelImage,
    6: ModelVideo,
    7: ModelRefreshTime,
    8: ModelVisibility,
    101: ModelArea,
    102: ModelItemType,
    103: ModelItemName,
    104: ModelItemNameRegex,
    105: ModelItemSize,
    106: ModelItemCount,
    201: ModelUnderground,
    202: ModelUndergroundLayer,
    301: ModelLinkage,
    302: ModelLinkageAction,
  }[props.composedCondition.id]
}) as ComputedRef<Component>

const modelOptions = computed(() => toValue(props.composedCondition.option))
</script>

<template>
  <component
    :is="modelTemplate"
    v-if="modelTemplate"
    v-model="modelValue"
    :options="modelOptions"
    :meta="composedCondition.meta"
  />
</template>
