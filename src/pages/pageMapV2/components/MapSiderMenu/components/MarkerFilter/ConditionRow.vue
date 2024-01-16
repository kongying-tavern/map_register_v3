<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import type { Condition } from '@/stores/types'

const props = defineProps<{
  disabled?: boolean
  condition: Condition
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
      <div class="condition-unit">
        {{ condition.area.name }}
      </div>

      <div class="condition-unit">
        {{ condition.type.name }}
      </div>

      <div class="condition-unit condition-unit-button condition-unit-button__default" @click="handleReview">
        {{ condition.items.length }}
      </div>
    </div>

    <div
      class="condition-unit condition-unit-button condition-unit-button__delete"
      :class="{
        'is-disabled': disabled,
      }"
      @click="handleDelete"
    >
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
  --color-dark-disabled: #6b6964;

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

  &:not(.is-disabled) {
    &:hover {
      outline-color: #FFFFFF80;
    }
    &:active {
      outline-color: #00000020;
    }
    cursor: pointer;
  }

  &.is-disabled {
    cursor: not-allowed;
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

  &:not(.is-disabled):hover {
    background: var(--color-dark-light);
  }
  &:not(.is-disabled):active {
    background: var(--color-dark-hover);
    color: var(--color-dark);
  }

  &.is-disabled {
    color: #b3b3b3;
    background: var(--color-dark-disabled);
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
