<script setup lang="ts">
defineOptions({
  name: 'FilterTabPanel',
})

defineProps<{
  label: string
  content: string
  value: number
}>()

const modelValue = inject<Ref<number>>('modelValue', ref(-1))
</script>

<template>
  <div v-show="value === modelValue" class="h-full overflow-hidden">
    <slot name="default" />
  </div>
</template>
