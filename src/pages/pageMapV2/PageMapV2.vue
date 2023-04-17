<script lang="ts" setup>
import { useMap, useMarkerDrawer } from './hooks'
import { CollapseButton, MapSiderMenu, MarkerDrawer } from './components'

const canvasRef = ref<HTMLCanvasElement | null>(null)
useMap(canvasRef)

const collapse = ref(true)
useEventListener('keypress', (ev) => {
  if (ev.code === 'Backquote')
    collapse.value = !collapse.value
})

useMarkerDrawer(canvasRef)
</script>

<template>
  <div class="w-full h-full relative">
    <canvas ref="canvasRef" class="w-full h-full bg-black" />

    <div class="absolute top-2 left-2">
      <CollapseButton v-model:collapse="collapse" />
    </div>

    <MapSiderMenu v-model:collapse="collapse" />

    <MarkerDrawer />
  </div>
</template>
