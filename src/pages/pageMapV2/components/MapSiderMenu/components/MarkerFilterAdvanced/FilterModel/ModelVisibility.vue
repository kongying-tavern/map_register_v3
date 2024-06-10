<script lang="ts" setup>
import { MarkerFilterButton } from '../../MarkerFilterComponent'
import { SelectBase } from '.'
import type { MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'
import { IconEye } from '@/components/AppIcons'
import { useHiddenFlagOptions } from '@/hooks'

defineProps<{
  options: MAFOptionSelect<{ label: string; value: number }>
}>()

const { hiddenFlagNameMap } = useHiddenFlagOptions()

const modelValue = defineModel<MAFValueNumberArray>('modelValue', {
  required: false,
  default: {
    na: [],
  },
})

const selectTag = computed(() => {
  return (modelValue.value.na ?? [])
    .map(v => hiddenFlagNameMap.value[v ?? ''])
    .filter(v => v)
    .join(',')
})
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">可见范围</span>
    <SelectBase
      v-model="modelValue.na"
      :options="options"
    >
      <MarkerFilterButton theme="dark">
        <template #icon>
          <IconEye />
        </template>
        <template v-if="selectTag" #default>
          {{ selectTag }}
        </template>
      </MarkerFilterButton>
    </SelectBase>
  </div>
</template>
