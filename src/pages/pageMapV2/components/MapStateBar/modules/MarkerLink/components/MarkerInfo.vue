<script setup lang="ts">
import { useIconTagStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { AppIconTagRenderer } from '@/components'

withDefaults(defineProps<{
  marker?: GSMapState.MarkerWithRenderConfig
  placeholder?: string
}>(), {
  placeholder: '--N/A--',
})

const iconTagStore = useIconTagStore()
</script>

<template>
  <div class="marker-info">
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
  background: var(--el-color-primary-light-9);
  border-radius: 4px;

  &:hover {
    background-color: var(--el-color-primary-light-7);
  }
}
</style>
