<script lang="ts" setup>
const props = defineProps<{
  modelValue: number
  stepNames: string[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

const activeStep = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="item-step-panel genshin-text w-full flex rounded relative text-white"
  >
    <div
      v-for="(step, index) in stepNames"
      :key="step"
      :class="{ actived: activeStep === index }"
      class="step-unit"
      @click="(activeStep = index)"
    >
      {{ step }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-step-panel {
  // 中间单元背景色的右侧剪裁点
  --clip-middle-r: 90%;
  // 中间单元背景色的左侧剪裁点
  --clip-middle-l: calc(100% - var(--clip-middle-r));
  // 末尾单元背景色的左侧剪裁点
  --clip-last-l: calc(var(--clip-middle-l) / 2);
  // 首个单元背景色的右侧剪裁点
  --clip-first-r: calc(100% - var(--clip-last-l));
  // 每个单元背景尺寸超出的长度
  --flow-width: 2px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    transition: all 200ms ease-in-out;
  }
}

.step-unit {
  --background: var(--content-background);

  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  position: relative;

  &.actived {
    color: rgb(0 0 0 / 0.8);
    --background: rgb(144 147 153 / 0.6);
  }

  &:not(:first-of-type):not(:last-of-type) {
    &::before, &::after {
      content: '';
      position: absolute;
      height: 100%;
      z-index: -1;
      width: calc(50% + var(--flow-width));
      background-color: var(--background);
    }
    &::before {
      right: 50%;
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, var(--clip-middle-l) 50%);
    }
    &::after {
      left: 50%;
      clip-path: polygon(0% 0%, var(--clip-middle-r) 0%, 100% 50%, var(--clip-middle-r) 100%, 0 100%);
    }
  }

  &:first-of-type::before, &:last-of-type::before {
    content: '';
    position: absolute;
    height: 100%;
    z-index: -1;
    width: calc(100% + var(--flow-width));
    background-color: var(--background);
  }

  &:first-of-type::before {
    clip-path: polygon(0% 0%, var(--clip-first-r) 0%, 100% 50%, var(--clip-first-r) 100%, 0 100%);
  }
  &:last-of-type::before {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, var(--clip-last-l) 50%);
  }
}
</style>
