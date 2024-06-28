<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <details open class="diff-item pr-3 mb-2">
    <summary class="divider-line font-bold select-none">
      {{ label }}
    </summary>

    <div class="mb-2">
      <slot name="default" />
    </div>
  </details>
</template>

<style scoped>
.diff-item {
  --tint-color: var(--el-text-color-secondary);

  &[open] {
    --tint-color: var(--el-color-primary);
  }
}

.divider-line {
  position: relative;
  color: var(--tint-color);
  cursor: pointer;

  &:hover {
    --tint-color: var(--el-text-color-regular);
  }

  &::marker {
    background: var(--tint-color);
  }

  &::before {
    width: 100%;
    height: 100%;
    left: 0;
    position: absolute;
    content: '';
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      transparent calc(50% - 0.5px),
      var(--tint-color) calc(50% - 0.5px),
      var(--tint-color) calc(50% + 0.5px),
      transparent calc(50% + 0.5px)
    );
    clip-path: inset(0 0 0 21%);
  }
}
</style>
