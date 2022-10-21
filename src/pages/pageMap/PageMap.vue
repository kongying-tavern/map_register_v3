<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { useMap } from './hooks'
import { useTheme } from '@/hooks'
import { AppUserAvatar } from '@/components'

const containerRef = ref<HTMLElement | null>(null)
const { mapName, tileOptions } = useMap(containerRef)

const { isDark } = useTheme()
onBeforeMount(() => {
  isDark.value = true
})
onBeforeUnmount(() => {
  isDark.value = false
})
</script>

<template>
  <div class="w-full h-full relative overflow-hidden">
    <div ref="containerRef" class="absolute w-full h-full" style="background: #000" />

    <div class="custom-control-panel absolute left-4 top-4 bg-slate-800 bg-opacity-50 rounded flex flex-col p-2">
      <el-select v-model="mapName">
        <el-option v-for="opt in tileOptions" :key="opt" :value="opt" :label="opt" />
      </el-select>
    </div>

    <div class="custom-control-panel absolute right-4 top-4 bg-slate-800 bg-opacity-50 rounded">
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
