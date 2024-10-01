<script setup lang="ts">
import { TRANSITION_EVENTS } from '@deck.gl/core'
import type { OrthographicViewState } from '@deck.gl/core'

const viewState: Ref<OrthographicViewState> = ref({
  zoom: -4,
  minZoom: -4,
  maxZoom: 2,
  target: [0, 0],
  transitionDuration: 150,
  transitionEasing: t => t,
  transitionInterruption: TRANSITION_EVENTS.BREAK,
})
</script>

<template>
  <div class="w-full h-full overflow-hidden">
    {{ viewState }}
  </div>
</template>
