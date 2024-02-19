<script setup lang="ts">
import { useIconTagStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { AppIconTagRenderer } from '@/components'

withDefaults(defineProps<{
  marker?: GSMapState.MarkerWithRenderConfig
  placeholder?: string
  color?: string
}>(), {
  placeholder: '--N/A--',
  color: '#FFFF00',
})

const iconTagStore = useIconTagStore()
</script>

<template>
  <div
    class="marker-info"
    :style="{
      '--color': color,
    }"
  >
    <div v-if="!marker" class="h-full grid place-items-center">
      <el-text>{{ placeholder }}</el-text>
    </div>

    <div v-else class="h-full grid place-items-center place-content-center">
      <AppIconTagRenderer
        :mapping="iconTagStore.tagPositionMap[marker.render.mainIconTag]"
        :src="iconTagStore.tagSpriteUrl"
        class="w-8 h-8"
      />
      <el-text>{{ marker.markerTitle }}</el-text>
    </div>
  </div>
</template>

<style scoped>
.marker-info {
  height: 64px;
  flex: 1;
  font-size: 14px;
  outline: 1px solid #CCCCCC20;
  border: 2px solid color-mix(in srgb, var(--color), #00000020);
  border-radius: 4px;
}
</style>
