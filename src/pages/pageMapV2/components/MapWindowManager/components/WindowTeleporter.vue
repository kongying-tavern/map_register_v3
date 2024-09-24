<script setup lang="ts">
import { context } from '../core'

const props = defineProps<{
  id: string
  beforeClose?: (done: () => void) => void
}>()

const emits = defineEmits<{
  close: []
}>()

const contextWindow = computed(() => {
  return context.getWindow(props.id)
})

context.closeHook.on((id) => {
  if (id !== props.id)
    return
  emits('close')
})
</script>

<template>
  <Teleport v-if="contextWindow?.ref" :to="contextWindow.ref">
    <slot name="default" />
  </Teleport>
</template>
