<script lang="ts" setup>
import { useMap } from './hooks'
import { CollapseButton, MapSiderMenu } from './components'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { map } = useMap(canvasRef)

const hasBeenDragged = ref(false)
const collapse = ref(true)

useEventListener('keypress', (ev) => {
  if (ev.code === 'Backquote')
    collapse.value = !collapse.value
})

useEventListener(canvasRef, 'pointerdown', () => {
  const stopListenMove = useEventListener('pointermove', () => {
    if (!map.value)
      return
    hasBeenDragged.value = true
    map.value.hover = null
  })
  useEventListener('pointerup', () => {
    stopListenMove()
  }, { once: true })
  if (!map.value?.hover)
    return
  map.value.active = map.value.hover
})

useEventListener(canvasRef, 'pointerup', () => {
  if (!map.value)
    return
  map.value.active = map.value.hover
})

useEventListener(canvasRef, 'click', () => {
  if (!map.value)
    return
  if (hasBeenDragged.value) {
    hasBeenDragged.value = false
    return
  }
  map.value.focus = map.value?.hover ?? null
})

const blurMarker = () => {
  if (!map.value)
    return
  map.value.focus = null
  map.value.active = null
  map.value.hover = null
}
</script>

<template>
  <div class="w-full h-full relative">
    <canvas ref="canvasRef" class="w-full h-full bg-black" />

    <div class="absolute top-2 left-2">
      <CollapseButton v-model:collapse="collapse" />
    </div>

    <MapSiderMenu v-model:collapse="collapse" />

    <el-drawer
      :model-value="Boolean(map?.focus)"
      :show-close="false"
      :with-header="false"
      class="marker-info-drawer"
      append-to-body
      @close="blurMarker"
    >
      {{ map?.focus }}
    </el-drawer>
  </div>
</template>
