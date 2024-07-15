<script setup lang="ts">
withDefaults(defineProps<{
  current?: number
  total?: number
  label: string
}>(), {
  current: 0,
  total: 0,
})
</script>

<template>
  <div class="flex-1 flex items-center overflow-hidden gap-1">
    <div
      class="h-5 min-w-[20px] px-1 grid place-content-center rounded text-xs border border-[currentColor] font-mono"
      :style="{
        opacity: current > 0 ? '1' : '0.4',
      }"
      title="已启用 / 图层总数"
    >
      {{ `${current}`.padStart(2, '0') }}/{{ `${total}`.padStart(2, '0') }}
    </div>
    <div
      class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis"
      :title="label"
    >
      {{ label }}
    </div>
  </div>
</template>
