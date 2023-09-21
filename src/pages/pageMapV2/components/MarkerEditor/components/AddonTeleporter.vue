<script lang="ts" setup>
import { addonPanelRefKey } from '../shared'

defineProps<{
  active: boolean
}>()

const extraPanelRef = inject(addonPanelRefKey, ref(null))
</script>

<template>
  <Teleport v-if="extraPanelRef && active" :to="extraPanelRef">
    <slot :extra-panel-ref="extraPanelRef" />
  </Teleport>
</template>
