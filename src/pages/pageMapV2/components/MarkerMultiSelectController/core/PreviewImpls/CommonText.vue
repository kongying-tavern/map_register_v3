<script setup lang="ts">
defineProps<{
  value: string
}>()
</script>

<template>
  <div class="overflow-hidden whitespace-nowrap text-ellipsis" :title="value">
    <pre class="text-xs font-mono">{{ value }}</pre>
  </div>
</template>
