<script lang="ts" setup>
import type { Column } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { PgUnit, usePagination } from '@/hooks'

const props = defineProps<{
  markerList: API.MarkerVo[]
}>()

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
  return props.markerList.slice((current - 1) * pageSize, current * pageSize)
})

const containerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(containerRef)

const columns = ref<Partial<Column>[]>([
  { title: 'ID', dataKey: 'id', width: 70 },
  { title: '名称', dataKey: 'markerTitle', width: 110 },
  { title: '说明', dataKey: 'content' },
])

const debugText = () => {
  ElMessage.warning('操作栏开发中')
}
</script>

<template>
  <div v-bind="$attrs" ref="containerRef" class="flex flex-col overflow-hidden">
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

  color: #CBD5EE;
  background-color: transparent;

  :deep(.el-button+.el-button) {
    margin-left: 4px;
  }
}

.table-pagination {
  --el-pagination-button-disabled-bg-color: rgba(124, 124, 124, 0.1);
  --el-pagination-bg-color: rgba(124, 124, 124, 0.1);
  --el-pagination-button-color: #CBD5EE;
  --el-text-color-regular: #CBD5EE;
}
</style>
