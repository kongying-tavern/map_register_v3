<script lang="ts" setup>
import { ArrowDownBold, ArrowUpBold, DeleteFilled } from '@element-plus/icons-vue'
import { MarkerFilterButton } from '../MarkerFilterComponent'
import type { MAFGroupComposed } from '@/stores/types'

const props = defineProps<{
  disabled?: boolean
  isFirst?: boolean
  isLast?: boolean
  withMoveUp?: boolean
  withMoveDown?: boolean
  composedCondition: MAFGroupComposed
}>()

const emits = defineEmits<{
  switchOperator: []
  toggleOpposite: []
  moveUpGroup: []
  moveDownGroup: []
  deleteGroup: []
  appendItem: []
}>()

const handleSwitchOperator = () => {
  if (props.disabled)
    return
  emits('switchOperator')
}

const handleToggleOpposite = () => {
  if (props.disabled)
    return
  emits('toggleOpposite')
}

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
  <div class="condition-group flex flex-col p-1 gap-1">
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
          v-if="!isFirst"
          theme="dark"
          icon-color="var(--gs-color-text)"
          @click="handleSwitchOperator"
        >
          <template #icon>
            {{ composedCondition.operator ? '且' : '或' }}
          </template>
        </MarkerFilterButton>
        <MarkerFilterButton
          theme="dark"
          :icon-color="composedCondition.opposite ? 'var(--gs-color-confirm)' : 'var(--gs-color-text)'"
          @click="handleToggleOpposite"
        >
          <template #icon>
            非
          </template>
        </MarkerFilterButton>
        <MarkerFilterButton
          v-if="withMoveUp && !isFirst"
          theme="dark"
          icon-color="var(--gs-color-confirm)"
          @click="handleMoveUpGroup"
        >
          <template #icon>
            <ArrowUpBold />
          </template>
        </MarkerFilterButton>
        <MarkerFilterButton
          v-if="withMoveDown && !isLast"
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
      v-for="(item, itemIndex) in composedCondition.children"
      :key="itemIndex"
      class="condition-item flex"
    >
      <slot
        :composed-condition="item"
        :index="itemIndex"
        :size="composedCondition.children.length"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-group {
  --height: 32px;
  --radius: 16px;
  --color-light: #C6C2BA;
  --color-dark: #313131;

  border-radius: var(--radius);
  background-color: var(--color-light);
  color: var(--color-dark);
}

.condition-item {
  border-radius: calc(var(--height) / 2);
  background-color: #E6E3DE;
  font-size: 14px;
  padding: 2px 4px;
}
</style>
