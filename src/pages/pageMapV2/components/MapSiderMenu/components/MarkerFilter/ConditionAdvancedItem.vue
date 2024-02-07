<script lang="ts" setup>
import { ConditionButton } from '.'

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
  <div class="flex-auto">
    <slot />
  </div>
  <div class="flex-none flex gap-1">
    <ConditionButton
      v-if="withMoveUp"
      theme="dark"
      icon-color="var(--gs-color-success)"
      @click="handleMoveUpItem"
    >
      <template #icon>
        <ArrowUpBold />
      </template>
    </ConditionButton>
    <ConditionButton
      v-if="withMoveDown"
      theme="dark"
      icon-color="var(--gs-color-success)"
      @click="handleMoveDownItem"
    >
      <template #icon>
        <ArrowDownBold />
      </template>
    </ConditionButton>
    <ConditionButton
      theme="dark"
      icon-color="var(--gs-color-danger)"
      @click="handleDeleteItem"
    >
      <template #icon>
        <CloseBold />
      </template>
    </ConditionButton>
  </div>
</template>
