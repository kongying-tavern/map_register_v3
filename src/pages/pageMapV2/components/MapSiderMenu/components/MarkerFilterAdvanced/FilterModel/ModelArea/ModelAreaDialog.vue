<script lang="ts" setup>
import { ref } from 'vue'
import { SelectList } from '../../../SelectList'
import type { AreaWithChildren } from '@/stores'

defineProps<{
  list: AreaWithChildren[]
  labelKey: keyof AreaWithChildren
  valueKey: keyof AreaWithChildren
}>()

const modelValue = defineModel<number[]>('modelValue', {
  required: true,
  default: [],
})

const childrenList = ref<AreaWithChildren[]>([])
</script>

<template>
  <div class="w-full flex-1 flex gap-2">
    <el-scrollbar class="flex-1">
      <SelectList
        v-model="childrenList"
        class="h-full overflow-auto gap-1"
        :list="list"
        value-key="children"
      >
        <template #default="{ item }">
          {{ item[labelKey] }}
        </template>
      </SelectList>
    </el-scrollbar>
    <el-scrollbar class="flex-1">
      <SelectList
        v-model:model-multiple-value="modelValue"
        :multiple="true"
        class="h-full overflow-auto gap-1"
        :list="childrenList"
        :value-key="valueKey"
      >
        <template #default="{ item }">
          {{ item[labelKey] }}
        </template>
      </SelectList>
    </el-scrollbar>
  </div>
</template>
