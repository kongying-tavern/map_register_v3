<script lang="ts" setup>
import { toValue } from 'vue'
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
import { useMapStateStore } from '@/stores'
import type { MAFItem, MAFMeta, MAFOption, MAFValue } from '@/stores/types'

const props = defineProps<{
  condition: MAFItem
}>()

const modelValue = defineModel<MAFValue>('modelValue', {
  required: false,
  default: {},
})

const { getMAFConfig } = useMapStateStore()

const model = computed(() => getMAFConfig(props.condition.id))

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
  }[props.condition.id]
}) as ComputedRef<Component>

const modelOptions = computed<MAFOption>(() => toValue(model.value.option))

const modelMeta = computed<MAFMeta>(() => model.value.prepare(modelValue.value, modelOptions.value))
</script>

<template>
  <component
    :is="modelTemplate"
    v-if="modelTemplate"
    v-model="modelValue"
    :options="modelOptions"
    :meta="modelMeta"
  />
</template>
