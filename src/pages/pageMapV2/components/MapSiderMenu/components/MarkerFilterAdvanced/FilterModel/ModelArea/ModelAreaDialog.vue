<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { SelectList } from '../../../SelectList'
import { useAreaStore } from '@/stores'
import type { AreaWithChildren } from '@/stores'

defineProps<{
  listClass?: string
  list: AreaWithChildren[]
  labelKey: string
  valueKey: string
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

const removeChildren = (parent: AreaWithChildren) => {
  const shallowCopyValue = [...modelValue.value]
  const valueSet = new Set<number>(shallowCopyValue)
  const childrenIds: number[] = (parent.children ?? []).map(child => child.id!).filter(v => v)
  childrenIds.forEach((childId) => {
    valueSet.delete(childId)
  })
  modelValue.value = Array.from(valueSet)
}
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
          <span class="flex-auto">{{ item[labelKey] }}</span>
          <el-button
            v-if=" childrenCountMap[item.id!] > 0"
            class="flex-none"
            type="primary"
            size="small"
            round
            .draggable="true"
            @drag.stop="removeChildren(item)"
          >
            {{ childrenCountMap[item.id!] }}
          </el-button>
        </template>
      </SelectList>
    </el-scrollbar>
    <div class="w-[2px] h-[97%] translate-y-[1.5%] bg-[#E3DDD140]" />
    <el-scrollbar class="flex-1">
      <SelectList
        v-model="modelValue"
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
