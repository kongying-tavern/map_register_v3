<script lang="ts" setup>
import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common'
import { useItemList, usePagination } from '@/hooks'

const columns: AnyColumn[] = [
  { title: '物品ID', dataKey: 'itemId', width: 50 },
  { title: '名称', dataKey: 'name', width: 200 },
  { title: '地区ID', dataKey: 'areaId', width: 200 },
]

const { pagination, layout } = usePagination()

const { itemList, loading, onSuccess: onItemListFetched } = useItemList({
  immediate: true,
  params: () => ({
    current: pagination.value.current,
    size: pagination.value.pageSize,
  }),
})

onItemListFetched(({ data: { record = [], total = 0 } = {} }) => {
  console.log('[物品列表]', record)
  pagination.value.total = total
})

const tableRef = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(tableRef)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="flex flex-col gap-2">
      filter
    </div>

    <div ref="tableRef" v-loading="loading" class="flex-1 overflow-hidden" element-loading-text="载入中...">
      <el-table-v2
        :columns="columns"
        :data="itemList"
        :width="width"
        :height="height"
        :border="true"
      />
    </div>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30, 40]"
      :pager-count="5"
      class="flex justify-end items-center"
      background
    />
  </div>
</template>
