<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
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

const removeChildren = (parent: AreaWithChildren | null) => {
  if (!parent)
    return
  const shallowCopyValue = [...modelValue.value]
  const valueSet = new Set<number>(shallowCopyValue)
  const childrenIds: number[] = (parent.children ?? []).map(child => child.id!).filter(v => v)
  childrenIds.forEach((childId) => {
    valueSet.delete(childId)
  })
  modelValue.value = Array.from(valueSet)
}

const dragCacheItem = shallowRef<AreaWithChildren | null>(null)

const dragStartHandler = (_e: DragEvent, item: AreaWithChildren) => {
  dragCacheItem.value = item
}

const dragEndHandler = (_e: DragEvent) => {
  removeChildren(dragCacheItem.value)
  dragCacheItem.value = null
}

const dropHandler = (e: DragEvent) => {
  const composedPath = e.composedPath() as HTMLElement[]
  const dragId = Number(composedPath.find(el => Number(el.dataset.dragId) > 0)?.dataset.dragId)
  if (!Number.isFinite(dragId))
    removeChildren(dragCacheItem.value)
  if (dragCacheItem.value && dragId !== dragCacheItem.value.id!)
    removeChildren(dragCacheItem.value)
  dragCacheItem.value = null
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
        @dragover.prevent
        @dragend.stop="dragEndHandler"
        @drop="dropHandler"
      >
        <template #default="{ item }">
          <div
            class="flex-auto flex"
            :data-drag-id="item.id"
          >
            <span class="flex-auto">{{ item[labelKey] }}</span>
            <el-button
              v-if=" childrenCountMap[item.id!] > 0"
              class="flex-none"
              type="primary"
              size="small"
              round
              .draggable="true"
              @dragstart.stop="(e) => dragStartHandler(e, item)"
            >
              {{ childrenCountMap[item.id!] }}
            </el-button>
          </div>
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
