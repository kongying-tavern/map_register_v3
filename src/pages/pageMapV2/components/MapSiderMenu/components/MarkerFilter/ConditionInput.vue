<script lang="ts" setup>
defineProps<{
  disabled?: boolean
  placeholder?: string
}>()

const nativeInputRef = ref<HTMLInputElement>() as Ref<HTMLInputElement>

const modelValue = defineModel<string>('modelValue', {
  required: true,
  default: '',
})
</script>

<template>
  <div
    class="condition-unit"
    :class="{ disabled }"
  >
    <div class="condition-unit-input__inner">
      <template v-if="$slots.prepend">
        <div class="condition-unit-input__separator condition-unit-input__prepend">
          <slot name="prepend" />
        </div>
      </template>
      <input
        ref="nativeInputRef"
        v-model="modelValue"
        class="condition-unit-input__internal"
        :placeholder="placeholder"
        :disabled="disabled"
      >
      <template v-if="$slots.append">
        <div class="condition-unit-input__separator condition-unit-input__append">
          <slot name="append" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-unit {
  --height: 32px;
  --color-bg: #fff;
  --color-border: #c2c2c2;
  --color-text: #323232;
  --color-placeholder: #ccc;
  --color-separator: #d3d6dd;

  height: 100%;
  display: inline-block;
  font-size: 14px;
  border-radius: var(--height);
  padding: 2px;

  &:not(:focus-within, .disabled):hover,
  &:focus-within {
    filter: brightness(99%);
  }

  &.disabled {
    filter: brightness(95%);
    &, .condition-unit-input__inner {
        cursor: not-allowed;
    }
  }
}

.condition-unit-input__inner {
  width: 100%;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--height);
  margin: 0;
}

.condition-unit-input__separator {
  --separator-gap: 8px;

  flex: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: block;
    width: 0;
    height: 55%;
    border: 2px none var(--color-separator);
  }
  &.condition-unit-input__prepend::after {
    right: 0;
    border-right-style: solid;
  }
  &.condition-unit-input__append::after {
    left: 0;
    border-left-style: solid;
  }

  &.condition-unit-input__prepend {
    padding-right: var(--separator-gap);
    margin-right: var(--separator-gap);
  }
  &.condition-unit-input__append {
    padding-left: var(--separator-gap);
    margin-left: var(--separator-gap);
  }

  &.condition-unit-input__prepend,
  &.condition-unit-input__append {
    flex: none;
  }
}

.condition-unit-input__internal {
  outline: none;
  flex: auto;

  &::placeholder {
    color: var(--color-placeholder);
  }
}
</style>
