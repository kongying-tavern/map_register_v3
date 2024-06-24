<script lang="ts" setup>
import { ModelItem } from '.'
import type { MAFGroupComposed } from '@/stores/types'
import { useMapStateStore } from '@/stores'
import { AppDraggableTable } from '@/components'

const emits = defineEmits<{
  appendItem: [groupIndex: number]
}>()

const modelValue = defineModel<MAFGroupComposed[]>('modelValue', {
  required: true,
  default: [],
})

const mapStateStore = useMapStateStore()

const { toggleMAFGroupOperator, toggleMAFGroupOpposite, deleteMAFGroup } = mapStateStore

// ------------------------------------------------
// 模型选择器相关
// ------------------------------------------------
const openPicker = (groupIndex: number) => {
  emits('appendItem', groupIndex)
}
</script>

<template>
  <AppDraggableTable
    v-model="modelValue"
    class="h-full flex flex-col gap-2"
    :get-key="g => g.key"
  >
    <template
      #default="{
        item: group,
        index: groupIndex,
        isGrabbing: isGroupGrabbing,
        isDragging: isGroupDragging,
      }"
    >
      <ModelItem
        class="sort-group"
        :class="{
          'is-grabbing': isGroupGrabbing,
          'is-dragging': isGroupDragging,
        }"
        :composed-condition="group"
        :is-first="groupIndex <= 0"
        :is-last="groupIndex >= modelValue.length - 1"
        :with-move-up="false"
        :with-move-down="false"
        @switch-operator="() => toggleMAFGroupOperator(groupIndex)"
        @toggle-opposite="() => toggleMAFGroupOpposite(groupIndex)"
        @delete-group="() => deleteMAFGroup(groupIndex)"
        @append-item="() => openPicker(groupIndex)"
      >
        <template
          #default="{
            composedCondition: item,
            index: itemIndex,
            size: itemSize,
            isFirst: isFirstItem,
            isLast: isLastItem,
            isGrabbing: isItemGrabbing,
            isDragging: isItemDragging,
          }"
        >
          <slot
            :group="group"
            :group-index="groupIndex"
            :is-group-grabbing="isGroupGrabbing"
            :is-group-dragging="isGroupDragging"
            :item="item"
            :item-index="itemIndex"
            :item-size="itemSize"
            :is-first-item="isFirstItem"
            :is-last-item="isLastItem"
            :is-item-grabbing="isItemGrabbing"
            :is-item-dragging="isItemDragging"
          />
        </template>
      </ModelItem>
    </template>
  </AppDraggableTable>
</template>
