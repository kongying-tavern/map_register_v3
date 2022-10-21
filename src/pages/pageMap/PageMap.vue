<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import type { MapNameEnum } from './configs'
import { mapTiles } from './configs'
import { useMap } from './hooks'

const containerRef = ref<HTMLElement | null>(null)
const { switchMap } = useMap(containerRef)

const options = Object.entries(mapTiles).reduce((seed, [key, mapTileConfig]) => {
  mapTileConfig.code && seed.push(key as MapNameEnum)
  return seed
}, [] as MapNameEnum[])
const mapName = ref<MapNameEnum>(options[0])

const handleNameChange = () => {
  switchMap(mapName.value)
}

const isDark = useDark()

onMounted(() => {
  isDark.value = true
  handleNameChange()
})

onUnmounted(() => {
  isDark.value = false
})
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div class="custom-control-panel absolute left-4 top-4 bottom-4 bg-slate-800 bg-opacity-50 rounded flex flex-col p-2">
      <el-select v-model="mapName" @change="handleNameChange">
        <el-option v-for="opt in options" :key="opt" :value="opt" :label="opt" />
      </el-select>
    </div>
    <div ref="containerRef" class="absolute w-full h-full" style="background: #000" />
  </div>
</template>

<style lang="scss" scoped>
.custom-control-panel {
  z-index: 1000;
  backdrop-filter: blur(10px);
}
</style>
