<script setup lang="ts">
import { useAppWindow } from '../hooks'
import type { MapWindow } from '../types'

const props = defineProps<{
  info?: MapWindow.Info
}>()

const emits = defineEmits<{
  close: []
}>()

const context = useAppWindow()

context.closeHook.on((id) => {
  if (id !== props.info?.id)
    return
  emits('close')
})
</script>

<template>
  <Teleport v-if="info?.ref" :to="info.ref">
    <slot name="default" />
  </Teleport>
</template>
