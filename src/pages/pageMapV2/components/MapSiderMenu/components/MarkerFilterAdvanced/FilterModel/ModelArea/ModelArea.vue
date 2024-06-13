<script lang="ts" setup>
import { Place } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { MarkerFilterButton, MarkerFilterSelectPanel } from '../../../MarkerFilterComponent'
import ModelAreaDialog from './ModelAreaDialog.vue'
import type { MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'
import { useAreaStore } from '@/stores'

defineProps<{
  options: MAFOptionSelect<{ [key: string]: string }>
}>()

const modelValue = defineModel<MAFValueNumberArray>('modelValue', {
  required: false,
  default: {
    na: [],
  },
})

const { areaIdMap } = storeToRefs(useAreaStore())

const areaTag = computed(() => modelValue.value.na
  .map(areaId => (areaIdMap.value.get(areaId) ?? {}).name!)
  .filter(v => v)
  .join(','),
)
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
          <template v-if="areaTag" #default>
            {{ areaTag }}
          </template>
        </MarkerFilterButton>
      </template>

      <template #list="listProps">
        <ModelAreaDialog v-bind="listProps" />
      </template>
    </MarkerFilterSelectPanel>
  </div>
</template>
