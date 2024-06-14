<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { MarkerFilterButton } from '../../MarkerFilterComponent'
import { SelectBase } from '.'
import type { MAFOptionSelect, MAFValueNumberArray } from '@/stores/types'
import { IconApplication } from '@/components/AppIcons'
import { useItemTypeStore } from '@/stores'

defineProps<{
  options: MAFOptionSelect<API.ItemTypeVo>
}>()

const modelValue = defineModel<MAFValueNumberArray>('modelValue', {
  required: false,
  default: {
    na: [],
  },
})

const { itemTypeMap } = storeToRefs(useItemTypeStore())

const typeTag = computed(() => modelValue.value.na
  .map(typeId => itemTypeMap.value[typeId]?.name)
  .filter(v => v)
  .join(','),
)
</script>

<template>
  <div class="flex-auto flex gap-1 items-center">
    <span class="flex-none">类别</span>
    <SelectBase
      v-model="modelValue.na"
      :options="options"
    >
      <MarkerFilterButton theme="dark">
        <template #icon>
          <IconApplication />
        </template>
        <template v-if="typeTag" #default>
          {{ typeTag }}
        </template>
      </MarkerFilterButton>
    </SelectBase>
  </div>
</template>
