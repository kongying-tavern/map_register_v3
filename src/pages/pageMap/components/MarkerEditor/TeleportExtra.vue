<script lang="ts" setup>
import type { Ref } from 'vue'

defineProps<{
  active: boolean
}>()

const extraPanelRef = inject('extraPanel') as Ref<HTMLElement | null>
</script>

<template>
  <Transition name="fade">
    <Teleport v-if="extraPanelRef && active" :to="extraPanelRef">
      <slot :extra-panel-ref="extraPanelRef" />
    </Teleport>
  </Transition>
</template>
