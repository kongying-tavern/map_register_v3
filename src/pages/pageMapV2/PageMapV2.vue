<script lang="ts" setup>
import { useContextMenu, useMap, useMarkerDrawer } from './hooks'
import { CollapseButton, MapAffix, MapContextMenu, MapOverlay, MapSiderMenu, MarkerDrawer } from './components'
import { GSSwitch } from '@/components'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { map, showTag, showUndergroundLayer, showBorder, showTooltip } = useMap(canvasRef)

const collapse = ref(true)
useEventListener('keypress', (ev) => {
  if (ev.code === 'Backquote')
    collapse.value = !collapse.value
})

useMarkerDrawer(canvasRef)

const { visible: contextMenuVisible, position: contextMenuPos } = useContextMenu()
</script>

<template>
  <div class="w-full h-full relative">
    <div class="genshin-map-mask" />

    <canvas ref="canvasRef" class="w-full h-full bg-black" />

    <div class="absolute top-2 left-2 z-10">
      <CollapseButton v-model:collapse="collapse" />
    </div>

    <div class="absolute bottom-2 left-2 flex flex-col gap-2 invisible sm:visible z-10">
      <GSSwitch v-model="showTag" label="显示地图标签" size="large" />
      <GSSwitch v-model="showUndergroundLayer" label="显示地下图层" size="large" />
      <GSSwitch v-model="showBorder" label="显示图层边界" size="large" />
      <GSSwitch v-model="showTooltip" label="显示调试信息" size="large" />
    </div>

    <template v-if="showUndergroundLayer">
      <MapAffix
        v-for="(group, key) in map?.baseLayer?.overlayManager?.overlayGroups"
        :key="key"
        :view="canvasRef"
        :pos="[group.bounds[2], group.bounds[3]]"
        zoom-with-map
      >
        <MapOverlay :option-group="group" />
      </MapAffix>
    </template>

    <MapAffix :pos="contextMenuPos" :visible="contextMenuVisible" :view="canvasRef">
      <MapContextMenu />
    </MapAffix>

    <MapSiderMenu v-model:collapse="collapse" class="z-10" />

    <MarkerDrawer class="z-10" />
  </div>
</template>

<style lang="scss" scoped>
.genshin-map-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(transparent 50%, #00000060);
  pointer-events: none;
  z-index: 1;
}
</style>
