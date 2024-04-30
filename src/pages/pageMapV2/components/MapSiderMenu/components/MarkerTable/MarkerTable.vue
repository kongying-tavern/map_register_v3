<script lang="tsx" setup>
import MarkerRow from './MarkerRow.vue'
import { useMapStateStore } from '@/stores'
import { AppVirtualTable } from '@/components'

const mapStateStore = useMapStateStore()
</script>

<template>
  <div class="marker-filter h-full">
    <AppVirtualTable
      class="pt-1"
      always-scrollbar
      :data="mapStateStore.currentLayerMarkers"
      :item-height="40"
      :cached-rows="2"
      :scrollbar-style="{
        '--el-scrollbar-bg-color': '#D3BC8E',
        '--el-scrollbar-opacity': '1',
        '--el-scrollbar-hover-bg-color': '#D3BC8E',
        '--el-scrollbar-hover-opacity': '0.5',
      }"
    >
      <template #default="{ item }">
        <MarkerRow :data="item" />
      </template>
    </AppVirtualTable>
  </div>
</template>

<style lang="scss" scoped>
.marker-filter {
  width: 400px;
}
</style>
