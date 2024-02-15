<script lang="ts" setup>
import { ArrowDownBold, ArrowUpBold, DeleteFilled } from '@element-plus/icons-vue'
import { MarkerFilterButton } from '../MarkerFilterComponent'
import type { MAFGroup } from '@/stores/types'

const props = defineProps<{
  disabled?: boolean
  withMoveUp?: boolean
  withMoveDown?: boolean
  condition: MAFGroup
}>()

const emits = defineEmits<{
  (e: 'moveUpGroup'): void
  (e: 'moveDownGroup'): void
  (e: 'deleteGroup'): void
  (e: 'appendItem'): void
}>()

const handleMoveUpGroup = () => {
  if (props.disabled)
    return
  emits('moveUpGroup')
}

const handleMoveDownGroup = () => {
  if (props.disabled)
    return
  emits('moveDownGroup')
}

const handleDeleteGroup = () => {
  if (props.disabled)
    return
  emits('deleteGroup')
}

const handleAppendItem = () => {
  if (props.disabled)
    return
  emits('appendItem')
}
</script>

<template>
  <div class="condition-group flex flex-col px-1 py-2 gap-2">
    <div class="condition-group-title flex">
      <div class="flex-none flex gap-1">
        <MarkerFilterButton
          theme="dark"
          icon-color="var(--gs-color-danger)"
          @click="handleDeleteGroup"
        >
          <template #icon>
            <DeleteFilled />
          </template>
          删除
        </MarkerFilterButton>
      </div>

      <div class="flex-auto" />

      <div class="flex-none flex gap-1">
        <MarkerFilterButton
          v-if="withMoveUp"
          theme="dark"
          icon-color="var(--gs-color-confirm)"
          @click="handleMoveUpGroup"
        >
          <template #icon>
            <ArrowUpBold />
          </template>
        </MarkerFilterButton>
        <MarkerFilterButton
          v-if="withMoveDown"
          theme="dark"
          icon-color="var(--gs-color-confirm)"
          @click="handleMoveDownGroup"
        >
          <template #icon>
            <ArrowDownBold />
          </template>
        </MarkerFilterButton>
        <MarkerFilterButton
          theme="dark"
          icon-color="var(--gs-color-success)"
          @click="handleAppendItem"
        >
          <template #icon>
            <Plus />
          </template>
          新增条目
        </MarkerFilterButton>
      </div>
    </div>

    <div
      v-for="(item, itemIndex) in condition.children"
      :key="itemIndex"
      class="condition-item flex"
    >
      <slot
        :condition="item"
        :index="itemIndex"
        :size="condition.children.length"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-group {
  --height: 32px;
  --radius: 6px;
  --color-light: #c6c2ba;
  --color-dark: #313131;

  border-radius: var(--radius);
  background-color: var(--color-light);
  color: var(--color-dark);
}

.condition-item {
  border-radius: calc(var(--height) / 2);
  background-color: #FFF;
  font-size: 14px;
  padding: 2px 4px;
  padding-left: 8px;
}
</style>
