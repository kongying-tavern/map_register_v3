<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { useLayer, useMap } from './hooks'
import { AppUserAvatar } from '@/components'

const containerRef = ref<HTMLElement | null>(null)

const { map, onMapCreated } = useMap(containerRef)
const { layers, activeLayer, selectLayer } = useLayer(map)

onMapCreated(() => {
  selectLayer(Object.keys(layers.value)[0])
})
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <div class="custom-control-panel absolute left-4 top-4 bg-white dark:bg-slate-600 bg-opacity-30 dark:bg-opacity-50 rounded flex flex-col p-2">
      <el-button-group size="small">
        <el-button
          v-for="(layer, name) in layers"
          :key="name"
          :type="activeLayer?.name === name ? 'primary' : ''"
          @click="() => selectLayer(name)"
        >
          {{ layer.name }}
        </el-button>
      </el-button-group>
    </div>

    <div class="custom-control-panel absolute right-4 top-4 bg-white dark:bg-slate-600 bg-opacity-30 dark:bg-opacity-50 rounded">
      <AppUserAvatar map-mode />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-control-panel {
  z-index: 1000;
  backdrop-filter: blur(10px);
}
</style>
