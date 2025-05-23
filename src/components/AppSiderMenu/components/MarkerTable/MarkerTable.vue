<script lang="tsx" setup>
import { AppVirtualTable } from '@/components'
import { useMarkerControl } from '@/hooks'
import { useIconTagStore, useMapStateStore } from '@/stores'
import MarkerRow from './MarkerRow.vue'

const iconTagStore = useIconTagStore()
const mapStateStore = useMapStateStore()

const { hover: hoveredMarker, focus: focusedMarker, focusMarker, hoverMarker } = useMarkerControl()

/**
 * 由于地图依赖点位排序来控制遮挡顺序，这里需要重新排序。
 * 按 updateTime 降序。
 */
const resortedMarkers = computed(() => mapStateStore.currentLayerMarkers.toSorted(({ updateTime: ta }, { updateTime: tb }) => {
  if ((ta === undefined) && (tb === undefined))
    return 0
  if (ta === undefined)
    return -1
  if (tb === undefined)
    return 1
  return new Date(tb).getTime() - new Date(ta).getTime()
}))
</script>

<template>
  <div class="marker-filter h-full">
    <div v-if="!resortedMarkers.length" class="h-full grid place-items-center content-center text-white font-['HYWenHei-85W']">
      <img class="w-60 h-60" src="/icons/qiliangliang.png">
      <div>没有符合条件的点位</div>
    </div>

    <AppVirtualTable
      v-else
      always-scrollbar
      :data="resortedMarkers"
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
          @focus="marker => focusMarker(marker)"
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
