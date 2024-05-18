<script lang="tsx" setup>
import MarkerRow from './MarkerRow.vue'
import { useIconTagStore, useMapStateStore } from '@/stores'
import { AppVirtualTable } from '@/components'
import { useMarkerFocus } from '@/pages/pageMapV2/hooks'

const iconTagStore = useIconTagStore()
const mapStateStore = useMapStateStore()

const { hover: hoveredMarker, focus: focusedMarker, focusMarker, hoverMarker } = useMarkerFocus()
</script>

<template>
  <div class="marker-filter h-full">
    <div v-if="!mapStateStore.currentLayerMarkers.length" class="h-full grid place-items-center content-center text-white genshin-text">
      <img class="w-60 h-60" src="/icons/qiliangliang.png">
      <div>没有符合条件的点位</div>
    </div>

    <AppVirtualTable
      v-else
      always-scrollbar
      :data="mapStateStore.currentLayerMarkers"
      :item-height="60"
      :cached-rows="2"
      :scrollbar-style="{
        '--el-scrollbar-bg-color': '#D3BC8E',
        '--el-scrollbar-opacity': '1',
        '--el-scrollbar-hover-bg-color': '#D3BC8E',
        '--el-scrollbar-hover-opacity': '0.5',
      }"
    >
      <template #default="{ item }">
        <MarkerRow
          :data="item"
          :is-hover="hoveredMarker?.id === item.id"
          :is-focus="focusedMarker?.id === item.id"
          :icon-src="iconTagStore.tagSpriteUrl"
          :icon-mapping="iconTagStore.tagPositionMap[item.render.mainIconTag]"
          @focus="marker => focusMarker(marker, { flyToMarker: true, delay: 400 })"
          @hover="hoverMarker"
        />
      </template>
    </AppVirtualTable>
  </div>
</template>

<style scoped>
.marker-filter {
  width: 350px;
}
</style>
