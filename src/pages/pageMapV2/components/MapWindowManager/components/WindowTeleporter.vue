<script setup lang="ts">
import { context } from '../core'

const props = defineProps<{
  id: string
  beforeClose?: (done: () => void) => void
}>()

const emits = defineEmits<{
  close: []
}>()

context.closeHook.on((id) => {
  if (id !== props.id)
    return
  emits('close')
})
</script>

<template>
  <Teleport v-if="context.getWindows()[id]?.ref" :to="context.getWindows()[id].ref">
    <slot name="default" />
  </Teleport>
</template>
