<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import ConditionButton from './ConditionButton.vue'
import type { ConditionBasic } from '@/stores/types'

const props = defineProps<{
  disabled?: boolean
  condition: ConditionBasic
}>()

const emits = defineEmits<{
  (e: 'review'): void
  (e: 'delete'): void
}>()

const handleReview = () => {
  if (props.disabled)
    return
  emits('review')
}

const handleDelete = () => {
  if (props.disabled)
    return
  emits('delete')
}
</script>

<template>
  <div class="condition-row genshin-text">
    <div class="h-full flex-1 flex items-center gap-1">
      <ConditionButton :clickable="false">
        {{ condition.area.name }}
      </ConditionButton>

      <ConditionButton :clickable="false">
        {{ condition.type.name }}
      </ConditionButton>

      <ConditionButton :disabled="disabled" @click="handleReview">
        {{ condition.items.length }}
      </ConditionButton>
    </div>

    <ConditionButton
      :disabled="disabled"
      theme="dark"
      icon-color="var(--gs-color-danger)"
      @click="handleDelete"
    >
      <template #icon>
        <DeleteFilled />
      </template>
      删除
    </ConditionButton>
  </div>
</template>

<style lang="scss" scoped>
.condition-row {
  --height: 32px;
  --color-light: #c6c2ba;
  --color-dark: #313131;

  height: var(--height);
  border-radius: calc(var(--height) / 2);
  padding: 4px;
  display: flex;
  gap: 4px;
  align-items: center;
  background: var(--color-light);
  color: var(--color-dark);
}
</style>
