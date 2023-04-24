<script lang="ts" setup>
import { useMap, useMarkerDrawer } from './hooks'
import { CollapseButton, MapSiderMenu, MarkerDrawer } from './components'
import { GSSwitch } from '@/components'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { showTag, showUndergroundLayer, showBorder, showTooltip } = useMap(canvasRef)

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

    <div class="absolute bottom-2 left-2 flex flex-col gap-2 invisible sm:visible">
      <GSSwitch v-model="showTag" label="显示地图标签" size="large" />
      <GSSwitch v-model="showUndergroundLayer" label="显示地下图层" size="large" />
      <GSSwitch v-model="showBorder" label="显示图层边界" size="large" />
      <GSSwitch v-model="showTooltip" label="显示调试信息" size="large" />
    </div>

    <MapSiderMenu v-model:collapse="collapse" />

    <MarkerDrawer />
  </div>
</template>
