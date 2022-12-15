<script lang="ts" setup>
import type { Column } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { markerListInjection } from '../shared'
import { PgUnit, usePagination } from '@/hooks'

defineProps<{
  loading?: boolean
}>()

const markerList = inject(markerListInjection, ref([]))

const { pagination, layout } = usePagination({
  init: {
    current: 1,
    total: 0,
    pageSize: 15,
  },
  units: [PgUnit.TOTAL, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

const pagableList = computed(() => {
  const { current, pageSize } = pagination.value
  return markerList.value.slice((current - 1) * pageSize, current * pageSize)
})

watch(() => markerList.value, () => {
  pagination.value.current = 1
})

const containerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(containerRef)

const columns = ref<Partial<Column & { dataKey: string }>[]>([
  { title: 'ID', dataKey: 'id', width: 70 },
  { title: '名称', dataKey: 'markerTitle', width: 110 },
  { title: '说明', dataKey: 'content' },
])

const debugText = () => {
  ElMessage.warning('操作栏开发中')
}
</script>

<template>
  <div v-bind="$attrs" ref="containerRef" v-loading="loading" element-loading-background="rgba(33, 33, 33, 0.7)" class="flex flex-col overflow-hidden text-white">
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
        <el-button type="danger" size="small" :icon="Delete" @click="debugText" />
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      :layout="layout"
      :total="markerList.length"
      :pager-count="5"
      class="table-pagination w-full flex gap-1 justify-center text-sm py-1"
    />
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
