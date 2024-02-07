<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div class="mb-4">
    <div class="pb-1">
      {{ name }}
    </div>
    <div class="flex flex-col gap-1">
      <slot name="default" />
    </div>
  </div>
</template>
