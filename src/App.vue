<script setup lang="ts">
import { TRANSITION_EVENTS } from '@deck.gl/core'
import { GenshinMapDeck } from '@/packages/map'
import type { GenshinMapViewState } from '@/packages/map'

const initialViewState: Ref<GenshinMapViewState> = ref({
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
    <GenshinMapDeck />
  </div>
</template>
