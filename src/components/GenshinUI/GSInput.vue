<script lang="ts" setup>
import type { Ref } from 'vue'

export interface GSInputProps {
  modelValue?: string
  disabled?: boolean
  placeholder?: string
}

export interface GSInputEmits {
  (e: 'update:modelValue', v?: string): void
}

const props = withDefaults(defineProps<GSInputProps>(), {
  modelValue: '',
  disabled: false,
})
const emits = defineEmits<GSInputEmits>()

const inputRef = ref<HTMLInputElement>() as Ref<HTMLInputElement>

const { focused } = useFocus(inputRef)

onMounted(() => {
  inputRef.value.value = props.modelValue
})

const onInput = (ev: Event) => {
  if (props.disabled)
    return
  const { value } = ev.target as HTMLInputElement
  emits('update:modelValue', value)
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="gs-input genshin-text"
    :class="{
      focused,
    }"
  >
    <input
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      class="gs-input__internal"
      @input="onInput"
    >
  </div>
</template>

<style lang="scss" scoped>
@keyframes bgFadeId {
  0% { filter: brightness(98%) }
  50% { filter: brightness(95%) }
  100% { filter: brightness(100%) }
}

.gs-input {
  height: 40px;
  outline: 1px solid #FFF;
  border: 2px solid #BFBFBF;
  border-radius: 999px;
  background: #fff;
  transition: all 150ms ease;
  overflow: hidden;
  &:not(:focus-within):hover {
    filter: brightness(98%);
  }
  // TODO 和游戏还是有一点差异，这里应该是在首次 active 的时候背景保持暗色，但在 focus 之后就不会再更改亮度了
  &:focus-within {
    animation: bgFadeId 200ms forwards;
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
