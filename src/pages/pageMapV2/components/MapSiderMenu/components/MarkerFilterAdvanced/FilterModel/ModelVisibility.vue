<script lang="ts" setup>
import { MarkerFilterButton } from '../../MarkerFilterComponent'
import { SelectBase } from '../FilterModelComponent'
import type { MAFMetaVisibility, MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'
import { IconEye } from '@/components/AppIcons'

defineProps<{
  options: MAFOptionSelect<{ label: string; value: number }>
  meta: MAFMetaVisibility
}>()

const modelValue = defineModel<MAFValueNumberArray>('modelValue', {
  required: false,
  default: {
    na: [],
  },
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
        <template v-if="meta.tag" #default>
          {{ meta.tag }}
        </template>
      </MarkerFilterButton>
    </SelectBase>
  </div>
</template>
