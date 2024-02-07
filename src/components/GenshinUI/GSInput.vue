<script lang="ts" setup>
import type { Ref } from 'vue'

export interface GSInputProps {
  modelValue?: string
  disabled?: boolean
  placeholder?: string
  autofocus?: boolean
}

export interface GSInputEmits {
  (e: 'update:modelValue', v?: string): void
  (e: 'input', v: InputEvent): void
  (e: 'focus', v: FocusEvent): void
}

const props = withDefaults(defineProps<GSInputProps>(), {
  modelValue: '',
  disabled: false,
})
const emits = defineEmits<GSInputEmits>()

const nativeInputRef = ref<HTMLInputElement>() as Ref<HTMLInputElement>

const { focused } = useFocus(nativeInputRef)
const focusInput = () => nativeInputRef.value.focus()

const nativeInputValue = computed(() => String(props.modelValue ?? ''))
const setNativeInputValue = () => {
  if (!nativeInputRef.value)
    return
  nativeInputRef.value.value = nativeInputValue.value
}
watch(nativeInputValue, setNativeInputValue)

const handleInput = async (ev: InputEvent) => {
  const { value } = ev.target as HTMLInputElement

  if (props.disabled)
    return

  emits('update:modelValue', value)
  emits('input', ev)

  await nextTick()
  setNativeInputValue()
}

useEventListener<InputEvent>(nativeInputRef, 'input', handleInput)
useEventListener<FocusEvent>(nativeInputRef, 'focus', ev => emits('focus', ev))

onMounted(() => {
  setNativeInputValue()
  props.autofocus && focusInput()
})
</script>

<template>
  <div v-bind="$attrs" class="gs-input genshin-text" :class="{ focused, disabled }">
    <div v-if="$slots.prepend" class="gs-input__prepend">
      <slot name="prepend" />
    </div>
    <input ref="nativeInputRef" :placeholder="placeholder" :disabled="disabled" class="gs-input__internal">
    <div v-if="$slots.append" class="gs-input__append">
      <slot name="append" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-input {
  --gs-input-bg-color: radial-gradient(
    #FFF calc(100% - 3px),
    #BFBFBF calc(100% - 3px),
    #BFBFBF calc(100% - 1px),
    #FFF calc(100% - 1px));
  --gs-input-border-color: #BFBFBF;
  --gs-input-text-color: #435066;

  height: 40px;
  display: inline-flex;
  border: 2px solid var(--gs-input-border-color);
  border-radius: 999px;
  background: var(--gs-input-bg-color);
  transition: all 150ms ease;
  overflow: hidden;
  color: var(--gs-input-text-color);
  font-size: 16px;

  // TODO 和游戏还是有一点差异，这里应该是在首次 active 的时候背景保持暗色，但在 focus 之后就不会再更改亮度了
  &:not(:focus-within, .disabled):hover {
    filter: brightness(95%);
  }

  &.disabled {
    --gs-input-bg-color: transparent;
    --gs-input-border-color: #ECE5D834;
    --gs-input-text-color: #959597;
  }
}

@mixin addon($color: #959597) {
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

@mixin separator($gap: 2px) {
  content: '';
  position: absolute;
  width: 2px;
  height: calc(100% - (2 * $gap));
  top: $gap;
  border-radius: $gap;
  background: var(--gs-input-border-color);
  opacity: 0.8;
}

.gs-input__prepend {
  @include addon();
  &::before {
    @include separator(6px);
    right: 0;
  }
}

.gs-input__append {
  @include addon();
  &::before {
    @include separator(6px);
    left: 0;
  }
}

.gs-input__internal {
  padding: 8px 16px;
  width: 100%;
  height: 100%;
  background: transparent;
  outline: none;
}
</style>
