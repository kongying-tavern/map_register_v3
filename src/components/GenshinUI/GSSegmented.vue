<script lang="ts" setup generic="LK extends string, VK extends string, T extends { [vk in VK]: string | number | boolean }">
import type { SegmentedProps } from 'element-plus'
import { ElSegmented } from 'element-plus'

type ValueTypes = string | number | boolean

type OptionType = SegmentedProps['options'][0]

const props = defineProps<{
  size: '' | 'large' | 'default' | 'small'
  options: T[]
  labelKey: LK
  valueKey: VK
}>()

const modelValue = defineModel<ValueTypes>('modelValue')

const componentOptions = computed<OptionType[]>(() => {
  return props.options
    .map((option) => {
      const label = option[props.labelKey]
      const value = option[props.valueKey] as ValueTypes
      return { label, value } as OptionType
    })
})
</script>

<template>
  <ElSegmented
    v-model="modelValue"
    class="gs-segmented"
    :size="size"
    :options="componentOptions"
  />
</template>

<style lang="scss" scoped>
.gs-segmented {
  --gs-segment-dark: #353d4f;
  --gs-segment-light: #fff8de;
  --el-segmented-color: var(--gs-segment-light);
  --el-segmented-bg-color: var(--gs-segment-dark);
  --el-segmented-item-hover-bg-color: transparent;
  --el-segmented-item-hover-color: color-mix(in srgb, var(--gs-segment-light), #fff 50%);
  --el-segmented-item-selected-color: var(--gs-segment-dark);
  --el-segmented-item-selected-bg-color: color-mix(in srgb, var(--gs-segment-light), transparent 10%);
  --el-border-radius-base: 50cqh;
}
</style>
