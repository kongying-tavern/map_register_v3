<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { useMap } from './hooks'
import { tileOptions } from './configs'
import { AppUserAvatar } from '@/components'

const containerRef = ref<HTMLElement | null>(null)
const { map } = useMap(containerRef)

const mapName = computed({
  get: () => map.value?.currentLayer?.value?.name,
  set: (name) => {
    if (!name)
      return
    map.value?.switchMap(name)
  },
})

const logMap = () => {
  console.log('[map]', map.value)
}
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="genshin-map absolute w-full h-full" style="background: #000" />

    <div class="custom-control-panel absolute left-4 top-4 bg-white dark:bg-slate-600 bg-opacity-30 dark:bg-opacity-50 rounded flex flex-col p-2">
      <el-row>
        <el-select v-model="mapName">
          <el-option v-for="opt in tileOptions" :key="opt" :value="opt" :label="opt" />
        </el-select>
      </el-row>
      <el-button type="primary" plain @click="logMap">
        Map
      </el-button>
    </div>

    <div class="custom-control-panel absolute right-4 top-4 bg-white dark:bg-slate-600 bg-opacity-30 dark:bg-opacity-50 rounded">
      <AppUserAvatar map-mode />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.genshin-map {
  :deep(.leaflet-tile) {
    pointer-events: all;
    border: 1px solid red;
  }
}

.custom-control-panel {
  z-index: 1000;
  backdrop-filter: blur(10px);
}
</style>
