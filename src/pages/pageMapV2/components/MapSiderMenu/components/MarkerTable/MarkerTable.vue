<script lang="tsx" setup>
import type { Column } from 'element-plus'
import { MarkerButton } from '.'
import { useMapStateStore } from '@/stores'

const tableContainerRef = ref<HTMLElement | null>()
const { width, height } = useElementSize(tableContainerRef)

const mapStateStore = useMapStateStore()

const columns = ref<Column[]>([
  { title: 'ID', key: 'id', dataKey: 'id', width: 60, align: 'right' },
  { title: '点位名称', key: 'markerTitle', width: 110, cellRenderer: ({ rowData: data }) => <MarkerButton data={data} /> },
  { title: '点位说明', key: 'content', dataKey: 'content', width: 200 },
])
</script>

<template>
  <div ref="tableContainerRef" class="marker-filter h-full">
    <el-table-v2
      :columns="columns"
      :data="mapStateStore.currentLayerMarkers"
      :cache="15"
      :width="width"
      :height="height"
      :estimated-row-height="40"
      expand-column-key="content"
      class="marker-table"
      header-class="marker-table-header"
      fixed
      :h-scrollbar-size="0"
    >
      <template #empty>
        <div class="flex items-center justify-center h-100%">
          <el-empty image="/icons/qiliangliang.png" :image-size="300" />
        </div>
      </template>
    </el-table-v2>
  </div>
</template>

<style lang="scss" scoped>
.marker-filter {
  width: 350px;
}

.marker-table {
  --el-bg-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-border-color: transparent;
  --el-table-row-hover-bg-color: #ffffff20;

  color: #E4DDD1;
  font-size: 12px;

  :deep(.el-table-v2__row-depth-0) {
    height: 40px;
  }

  :deep(.el-table-v2__header-row) {
    background: #00000020;
  }

  :deep(.el-table-v2__cell-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.expand-content) {
    background: #141b22;
    .min-height-text {
      min-height: 1.5em;
    }
  }
}
</style>
