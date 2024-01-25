<script setup lang="ts">
import { useIconTagStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { AppIconTagRenderer } from '@/components'

defineProps<{
  marker?: GSMapState.MarkerWithRenderConfig
}>()

const iconTagStore = useIconTagStore()
</script>

<template>
  <div class="marker-info">
    <div v-if="!marker">
      Empty
    </div>

    <div v-else>
      <AppIconTagRenderer
        :mapping="iconTagStore.tagPositionMap[marker.render.mainIconTag]"
        :src="iconTagStore.tagSpriteUrl"
        class="w-8 h-8"
      />
      <div>{{ marker.markerTitle }}</div>
    </div>
  </div>
</template>

<style scoped>
.marker-info {
  display: flex;
}
</style>
