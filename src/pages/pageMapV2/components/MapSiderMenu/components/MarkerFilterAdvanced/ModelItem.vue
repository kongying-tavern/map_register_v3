<script lang="ts" setup>
import { MarkerFilterButton } from '../MarkerFilterComponent'

const props = defineProps<{
  disabled?: boolean
  withMoveUp?: boolean
  withMoveDown?: boolean
}>()

const emits = defineEmits<{
  (e: 'moveUpItem'): void
  (e: 'moveDownItem'): void
  (e: 'deleteItem'): void
}>()

const handleMoveUpItem = () => {
  if (props.disabled)
    return
  emits('moveUpItem')
}

const handleMoveDownItem = () => {
  if (props.disabled)
    return
  emits('moveDownItem')
}

const handleDeleteItem = () => {
  if (props.disabled)
    return
  emits('deleteItem')
}
</script>

<template>
  <slot />
  <div class="flex-none flex gap-1 items-center">
    <MarkerFilterButton
      v-if="withMoveUp"
      icon-color="var(--gs-color-success)"
      @click="handleMoveUpItem"
    >
      <template #icon>
        <ArrowUpBold />
      </template>
    </MarkerFilterButton>
    <MarkerFilterButton
      v-if="withMoveDown"
      icon-color="var(--gs-color-success)"
      @click="handleMoveDownItem"
    >
      <template #icon>
        <ArrowDownBold />
      </template>
    </MarkerFilterButton>
    <MarkerFilterButton
      icon-color="var(--gs-color-danger)"
      @click="handleDeleteItem"
    >
      <template #icon>
        <CloseBold />
      </template>
    </MarkerFilterButton>
  </div>
</template>
