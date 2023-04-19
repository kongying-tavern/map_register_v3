<script lang="ts" setup>
import { CloseBold, Select } from '@element-plus/icons-vue'

export interface GSSwitchProps {
  modelValue?: boolean
  size?: 'small' | 'large'
  label?: string
}

export interface GSSwitchEmits {
  (e: 'update:modelValue', v?: boolean): void
}

defineProps<GSSwitchProps>()
defineEmits<GSSwitchEmits>()
</script>

<template>
  <div
    class="gs-switch genshin-text"
    :class="{
      actived: modelValue,
      label,
      [`size-${size ?? 'default'}`]: true,
    }"
    :data-label="label"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <div class="gs-switch__slider">
      <Transition name="pure-scale" appear>
        <component :is="modelValue ? Select : CloseBold" class="absolute" style="padding: calc(0.12 * var(--height))" />
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin sliderBackground() {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.gs-switch {
  --width: 50px;
  --height: 25px;
  --border-width: 1px;
  --bg: #353D4F;
  --slider-tr-x: 0;
  --icon-color: #D3BC8E;
  --label-color: #818D9D;

  &.size-small {
    --width: 40px;
    --height: 20px;
  }
  &.size-large {
    --width: 60px;
    --height: 30px;
  }

  width: var(--width);
  height: var(--height);
  border: var(--border-width) solid #EBE4D8;
  border-radius: var(--height);
  padding: calc(0.08 * var(--height));
  position: relative;
  cursor: pointer;
  user-select: none;
  color: var(--icon-color);

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: var(--bg);
    transition: all ease 150ms;
    z-index: -1;
    border: calc(0.04 * var(--height)) solid rgb(100 100 100 / 0.2);
    border-radius: var(--height);
  }

  &.label::after {
    content: attr(data-label);
    position: absolute;
    top: 0;
    left: 100%;
    padding: 0 0 0 8px;
    white-space: nowrap;
    color: var(--label-color);
  }

  &.actived {
    --slider-tr-x: calc(var(--width) - var(--height));
    --active-bg-scale: 1;
    --inactive-bg-scale: 0;
    --bg: #D3BC8E;
    --bg-border-color: #BFA57A;
    --icon-color: #818D9D;
    --label-color: #D3BC8E;
  }
}

.gs-switch__slider {
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 100%;
  background-color: #FFF8DE;
  transition: all ease 150ms;
  translate: var(--slider-tr-x) 0;
  filter: drop-shadow(0 0 1.5px #FFF8DE);
  position: relative;
}
</style>
