<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { SelectList } from '../../../SelectList'
import { useAreaStore } from '@/stores'
import type { AreaWithChildren } from '@/stores'

defineProps<{
  listClass?: string
  list: AreaWithChildren[]
  labelKey: keyof AreaWithChildren
  valueKey: keyof AreaWithChildren
}>()

const modelValue = defineModel<number[]>('modelValue', {
  required: true,
  default: [],
})

const { areaIdMap } = storeToRefs(useAreaStore())

const childrenList = ref<AreaWithChildren[]>([])

const parentIdMap = computed(() => {
  const parentIds: Record<number, number> = {}
  modelValue.value.forEach((areaId) => {
    const area = areaIdMap.value.get(areaId)
    if (!area)
      return
    parentIds[area.id!] = area.parentId!
  })
  return parentIds
})

const childrenCountMap = computed(() => {
  const childrenCount: Record<number, number> = {}
  modelValue.value.forEach((areaId) => {
    const parentId = parentIdMap.value[areaId]
    if (!parentId)
      return
    childrenCount[parentId] ??= 0
    childrenCount[parentId]++
  })
  return childrenCount
})
</script>

<template>
  {{ modelValue }}
  <div class="w-full flex-1 flex gap-2">
    <el-scrollbar class="flex-1">
      <SelectList
        v-model="childrenList"
        class="h-full overflow-auto gap-1"
        :list="list"
        value-key="children"
      >
        <template #default="{ item }">
          <span class="flex-auto">{{ item[labelKey] }}</span>
          <el-tag
            v-if=" childrenCountMap[item.id!] > 0"
            class="flex-none"
            effect="dark"
            round
          >
            {{ childrenCountMap[item.id!] }}
          </el-tag>
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
