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

const leftCorrection = computed(() => `${activeStep.value === 0 ? 2 : 0}px`)

const stepRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(stepRef)
</script>

<template>
  <div
    v-bind="$attrs"
    ref="stepRef"
    class="item-step-panel w-full flex rounded relative text-white"
    :style="{
      '--step': activeStep,
      '--step-width': `${width / stepNames.length}px`,
      '--left-correction': leftCorrection,
    }"
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
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.7);
    clip-path: inset(
      2px
      calc(2px + (2 - var(--step)) * var(--step-width))
      2px
      calc(var(--left-correction) + var(--step) * var(--step-width))
      round 4px
    );
    z-index: -1;
    pointer-events: none;
    transition: all 200ms ease-in-out;
  }
}

.step-unit {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: all 500ms ease-in-out;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    clip-path: inset(2px 2px 2px 0 round 4px);
    background-color: transparent;
    z-index: -1;
    transition: all 150ms ease-in-out;
  }
  &:first-of-type::before {
    clip-path: inset(2px round 4px);
  }
  &:not(.actived):hover::before {
    background-color: rgba(255, 255, 255, 0.4);
  }
  &:not(.actived):active::before {
    background-color: rgba(255, 255, 255, 0.5);
  }
}
</style>
