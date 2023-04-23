<script lang="ts" setup>
import type { Column } from 'element-plus'
import type { MarkerWithExtra } from '../../core'
import { useCurrentLayerMarkers } from '@/pages/pageMapV2/hooks'

const tableContainerRef = ref<HTMLElement | null>()
const { width, height } = useElementSize(tableContainerRef)

const { markers } = useCurrentLayerMarkers()

const columns = ref<Column<MarkerWithExtra>[]>([
  { title: 'id', dataKey: 'id', width: 80 },
  { title: '名称', dataKey: 'markerTitle', width: 100 },
])
</script>

<template>
  <div class="marker-filter h-full flex flex-col">
    <div ref="tableContainerRef" class="flex-1 overflow-hidden">
      <el-table-v2
        :columns="columns"
        :data="markers"
        :width="width"
        :height="height"
        class="marker-table"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marker-table {
  --el-bg-color: transparent;
  --el-table-bg-color: transparent;
}
</style>
