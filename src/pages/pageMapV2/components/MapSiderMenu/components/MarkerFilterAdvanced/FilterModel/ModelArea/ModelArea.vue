<script lang="ts" setup>
import { Place } from '@element-plus/icons-vue'
import { MarkerFilterButton, MarkerFilterSelectPanel } from '../../../MarkerFilterComponent'
import ModelAreaDialog from './ModelAreaDialog.vue'
import type { MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'

defineProps<{
  options: MAFOptionSelect<{ [key: string]: string }>
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
    <span class="flex-none">地区</span>
    <MarkerFilterSelectPanel
      v-model="modelValue.na"
      :multiple="options.optionSelectMultiple"
      :list="options.options"
      :label-key="options.optionLabel"
      :value-key="options.optionValue"
      :dialog-title="options.dialogTitle"
      :dialog-list-class="options.dialogListClass"
    >
      <template #default>
        <MarkerFilterButton theme="dark">
          <template #icon>
            <Place />
          </template>
        </MarkerFilterButton>
      </template>

      <template #list="props">
        <ModelAreaDialog
          v-model="modelValue.na"
          v-bind="props"
        />
      </template>
    </MarkerFilterSelectPanel>
  </div>
</template>
