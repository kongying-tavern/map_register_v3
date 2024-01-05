<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import type { Condition } from '@/stores/types'

defineProps<{
  condition: Condition
}>()

defineEmits<{
  (e: 'review'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="condition-row genshin-text">
    <div class="h-full flex-1 flex items-center gap-1">
      <div class="condition-unit">
        {{ condition.area.name }}
      </div>

      <div class="condition-unit">
        {{ condition.type.name }}
      </div>

      <div class="condition-unit condition-unit-button condition-unit-button__default" @click="$emit('review')">
        {{ condition.items.length }}
      </div>
    </div>

    <div class="condition-unit condition-unit-button condition-unit-button__delete" @click="$emit('delete')">
      <div class="icon">
        <DeleteFilled />
      </div>
      删除
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-row {
  --height: 32px;
  --color-light: #c6c2ba;
  --color-dark: #313131;
  --color-dark-light: #404040;
  --color-dark-hover: #ffe796;

  height: var(--height);
  border-radius: calc(var(--height) / 2);
  padding: 4px;
  display: flex;
  gap: 4px;
  align-items: center;
  background: var(--color-light);
  color: var(--color-dark);
}

.condition-unit {
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
  background: #FFF;
  border-radius: var(--height);
  padding: 0px 8px;
}

.condition-unit-button {
  outline: 2px solid transparent;
  user-select: none;
  transition: all ease 150ms;
  cursor: pointer;
  &:hover {
    outline-color: #FFFFFF80;
  }
  &:active {
    outline-color: #00000020;
  }
}

.condition-unit-button__default {
  &:hover {
    outline-color: #FFFFFF80;
  }
  &:active {
    background: var(--color-dark-hover);
    color: var(--color-dark);
  }
}

.condition-unit-button__delete {
  background: var(--color-dark);
  color: #FFF;
  gap: 4px;
  padding-left: 2px;
  &:hover {
    background: var(--color-dark-light);
  }
  &:active {
    background: var(--color-dark-hover);
    color: var(--color-dark);
  }
  .icon {
    color: var(--gs-color-danger);
    height: calc(var(--height) - 12px);
    width: calc(var(--height) - 12px);
    padding: 4px;
    border-radius: 50%;
    background: var(--color-dark);
  }
}
</style>
