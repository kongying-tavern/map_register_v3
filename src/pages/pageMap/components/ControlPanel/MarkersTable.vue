<script lang="ts" setup>
import type { Column } from 'element-plus'
import { Position } from '@element-plus/icons-vue'
import type { UnionMarkerVo } from '@/pages/pageMap/hooks'
import { useMap, useMarkerList } from '@/pages/pageMap/hooks'
import { useTheme } from '@/hooks'
import { GenshinMarker } from '@/pages/pageMap/core'

interface PaginationLike {
  total: number
  current: number
  pageSize: number
}

const props = defineProps<{
  pagination: PaginationLike
}>()

const emits = defineEmits<{
  (e: 'update:pagination', v: PaginationLike): void
}>()

const { map } = useMap()
const { isDark } = useTheme()
const { markerList, loading } = useMarkerList()

const pagableList = computed(() => {
  const { current, pageSize } = props.pagination
  return markerList.value.slice((current - 1) * pageSize, current * pageSize)
})

watch(() => markerList.value, (list) => {
  emits('update:pagination', {
    ...props.pagination,
    current: 1,
    total: list.length,
  })
})

const containerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(containerRef)

// 根据 table 容器高度动态计算每页项目数，最少保留 5 项
// TODO current 随着分页变化肯定要改，但是可能会乱飘，不确定怎么写比较好
// 考虑到正常使用时不会在 resize 的同时进行其他操作，这里先将 current 简单重置为 1
useResizeObserver(containerRef, ([{ contentBoxSize: [{ blockSize = 0 }] = [] }]) => {
  let { pageSize } = props.pagination
  // 39 是当前表头高度，40.22 是单行高度（未展开时）
  pageSize = Math.floor((blockSize - 39) / 40.22)
  pageSize < 5 && (pageSize = 5)
  emits('update:pagination', {
    ...props.pagination,
    pageSize,
    current: 1,
  })
})

const columns = ref<Partial<Column & { dataKey: string }>[]>([
  { title: 'ID', dataKey: 'id', width: 70 },
  { title: '名称', dataKey: 'markerTitle', width: 110 },
  { title: '说明', dataKey: 'content' },
])

const flyToMarker = ({ id, punctuateId }: UnionMarkerVo) => {
  if (!map.value)
    return

  const layers = map.value._layers as Record<string, L.Layer>
  for (const key in layers) {
    const marker = layers[key]
    if (!(marker instanceof GenshinMarker))
      continue

    const { id: markerId = -999999, punctuateId: markerPunctuateId = -999999 } = marker.marker
    if ((markerId !== id) && (markerPunctuateId !== punctuateId))
      continue

    const { lat, lng } = marker.getLatLng()
    map.value.flyTo([lat - 200, lng], 0, {
      animate: false,
    })
    marker.focus()
    break
  }
}
</script>

<template>
  <div
    v-bind="$attrs"
    ref="containerRef"
    v-loading="loading"
    element-loading-background="rgba(33, 33, 33, 0.7)"
    class="flex flex-col overflow-hidden text-white"
  >
    <el-table
      :width="width"
      :data="pagableList"
      :style="{
        width: `${width}px`,
      }"
      class="marker-table flex-1"
    >
      <el-table-column
        v-for="{ dataKey, title, ...rest } in columns"
        :key="dataKey"
        :prop="dataKey"
        :label="title"
        v-bind="rest"
      >
        <template #default="{ row }">
          <div class="w-full whitespace-nowrap overflow-ellipsis overflow-hidden" :title="row[dataKey ?? '']">
            {{ row[dataKey ?? ''] }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" :width="60">
        <template #default="{ row }">
          <el-button color="#AA9172" :dark="isDark" size="small" :icon="Position" @click="flyToMarker(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.marker-table {
  --el-table-border: none;
  --el-table-border-color: transparent;
  --el-table-header-bg-color: rgba(124, 124, 124, 0.2);
  --el-table-tr-bg-color: transparent;
  --el-bg-color: rgba(124, 124, 124, 0.1);
  --el-table-row-hover-bg-color: rgba(124, 124, 124, 0.5);

  background-color: transparent;
  color: #FFF;

  :deep(.el-button+.el-button) {
    margin-left: 4px;
  }
}

.table-pagination {
  --el-pagination-button-disabled-bg-color: rgba(124, 124, 124, 0.3);
  --el-pagination-bg-color: rgba(124, 124, 124, 0.3);
  --el-pagination-text-color: #FFF;
  --el-pagination-hover-color: var(--el-color-primary-light-3);
  --el-pagination-button-color: var(--el-pagination-text-color);
  --el-text-color-regular: var(--el-pagination-text-color);
}
</style>
