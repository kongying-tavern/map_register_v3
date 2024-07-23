<script setup lang="ts">
defineOptions({
  name: 'FilterTabPanel',
})

defineProps<{
  label: string
  content: string
  value: number
}>()
</script>

<template>
  {{ label }}
</template>
