<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { MapNameEnum } from './configs'
import { useMap } from './hooks'

const containerRef = ref<HTMLElement | null>(null)
const { switchMap } = useMap(containerRef)

const options = Object.keys(MapNameEnum) as MapNameEnum[]
const mapName = ref<MapNameEnum.TIVAT_BASE_0>(MapNameEnum.TIVAT_BASE_0)

const handleNameChange = () => {
  switchMap(mapName.value)
}

onMounted(handleNameChange)
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div class="custom-control-panel absolute left-0 top-0">
      <el-select v-model="mapName" @change="handleNameChange">
        <el-option v-for="opt in options" :key="opt" :value="MapNameEnum[opt]" :label="MapNameEnum[opt]" />
      </el-select>
    </div>
    <div ref="containerRef" class="absolute w-full h-full" style="background: #000" />
  </div>
</template>

<style lang="scss" scoped>
.custom-control-panel {
  z-index: 1000;
}
</style>
