<script lang="ts" setup>
import { useMap, useMarkerDrawer } from './hooks'
import { CollapseButton, MapAffix, MapOverlay, MapSiderMenu, MarkerDrawer, MarkerFocusIcon } from './components'
import { GSSwitch } from '@/components'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { map, showTag, showOverlay, showBorder, showTooltip } = useMap(canvasRef)

const collapse = ref(true)
useEventListener('keypress', (ev) => {
  if (ev.code === 'Backquote')
    collapse.value = !collapse.value
})

const { focus } = useMarkerDrawer(canvasRef)

const covertPosition = (positionExpression?: string) => {
  if (!positionExpression)
    return
  try {
    const pos = positionExpression.split(',').map(Number).slice(0, 2)
    return pos as [number, number]
  }
  catch {
    return undefined
  }
}
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
      <GSSwitch v-model="showOverlay" label="显示附加图层" size="large" />
      <GSSwitch v-model="showBorder" label="显示图层边界" size="large" />
      <GSSwitch v-model="showTooltip" label="显示调试信息" size="large" />
    </div>

    <div class="map-affix-provider pointer-events-none">
      <MapAffix
        v-for="(group, key) in map?.baseLayer?.overlayManager?.overlayGroups"
        :key="key"
        :view="canvasRef"
        :pos="[group.bounds[0], group.bounds[1]]"
        :visible="showOverlay"
        zoom-with-map
      >
        <MapOverlay :option-group="group" />
      </MapAffix>

      <MapAffix :view="canvasRef" :pos="covertPosition(focus?.position)" :visible="Boolean(focus)">
        <MarkerFocusIcon :marker="focus" />
      </MapAffix>
    </div>

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
