<script lang="ts" setup>
const props = withDefaults(defineProps<{
  clickable?: boolean
  disabled?: boolean
  iconColor?: string
  theme?: 'light' | 'dark'
}>(), {
  clickable: true,
  theme: 'light',
})

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const handleClick = (ev: MouseEvent) => {
  if (!props.clickable)
    return
  else if (props.disabled)
    return
  emits('click', ev)
}
</script>

<template>
  <div
    class="condition-unit"
    :class="[
      clickable ? 'condition-unit-button' : '',
      disabled ? 'is-disabled' : '',
      $slots.default ? '' : 'condition-unit-button__icon-only',
      `condition-unit-button__${theme}`,
    ]"
    @click="handleClick"
  >
    <div
      v-if="$slots.icon"
      class="icon"
      :style="{ '--icon-color': iconColor }"
    >
      <slot name="icon" />
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.condition-unit {
  --height: 32px;
  --color-light: #c6c2ba;
  --color-dark: #313131;
  --color-dark-light: #404040;
  --color-dark-hover: #ffe796;
  --color-dark-disabled: #6b6964;

  height: 24px;
  display: inline-flex;
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

  .icon {
    --icon-size: calc(var(--height) - 12px);

    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--icon-color);
    padding: 3px;
    width: var(--icon-size);
    height: var(--icon-size);
    border-radius: 50%;
  }
  &:has(.icon) {
    gap: 4px;
    padding-left: 2px;
  }

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

.condition-unit-button__icon-only {
  padding: 2px;
}

.condition-unit-button__light {
  color: var(--color-dark);

  .icon {
    background: #FFFFFF80;
  }

  &.condition-unit-button:hover {
    outline-color: #FFFFFF80;
  }
  &.condition-unit-button:active {
    background: var(--color-dark-hover);
    color: var(--color-dark);
  }
}

.condition-unit-button__dark {
  background: var(--color-dark);
  color: #FFF;

  .icon {
    background: var(--color-dark);
  }

  &.condition-unit-button:not(.is-disabled):hover {
    background: var(--color-dark-light);
  }
  &.condition-unit-button:not(.is-disabled):active {
    background: var(--color-dark-hover);
    color: var(--color-dark);
  }

  &.is-disabled {
    color: #b3b3b3;
    background: var(--color-dark-disabled);
  }
}
</style>
