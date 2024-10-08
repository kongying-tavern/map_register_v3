<script setup lang="ts">
import type { GenshinMapViewState } from '../types'
import { useGenshinMap } from '../hooks'

defineProps<{
  initialViewState?: GenshinMapViewState
}>()

const canvasRef = shallowRef<HTMLCanvasElement>()

const { instanceRef } = useGenshinMap(canvasRef, {

})

watch(instanceRef, () => {
  console.log('instance', instanceRef.value)
})
</script>

<template>
  <canvas ref="canvasRef" />
</template>
