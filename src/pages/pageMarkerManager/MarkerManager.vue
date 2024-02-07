<script lang="ts" setup>
import { ref } from 'vue'
import type { MarkerSearchParams } from './hooks'
import { useItemList, useMarkerBatchEdit, useSearchMarkerList } from './hooks'
import { MarkerBatchEditor, MarkerFilter, MarkerTable } from './components'
import { PgUnit, usePagination } from '@/hooks'

// ==================== 搜索 ====================
const queryForm = ref<MarkerSearchParams>({
  areaIdList: [],
  itemIdList: [],
  typeIdList: [],
  markerIdList: [],
})

// ==================== 分页 ====================
const { layout, pagination } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

// ==================== 点位 ====================
const { markerList, loading, updateMarkerList } = useSearchMarkerList({
  pagination,
  getParams: () => queryForm.value,
})

// ==================== 批量编辑 ====================
const markerSelections = ref<API.MarkerVo[]>([])

const countSelections = computed(() => {
  const lens = markerSelections.value.length
  return lens > 0 ? `: ${lens}` : ''
})

const multipleEditDialogVisible = ref<boolean>(false)
const handleBatchEdit = () => {
  multipleEditDialogVisible.value = true
}

const { batchEditForm, batchEditMarker, onSuccess: onBatchUpdateSuccess } = useMarkerBatchEdit({
  getParams: () => markerSelections.value,
})
onBatchUpdateSuccess(updateMarkerList)

// ==================== 物品 ====================
const { itemOptions } = useItemList({
  params: () => ({
    areaIdList: queryForm.value.areaIdList,
    typeIdList: queryForm.value.typeIdList,
  }),
})

// 当已选物品不存在于物品选项中时，重置已选物品
watch(itemOptions, (options) => {
  for (const itemId of queryForm.value.itemIdList) {
    if (!options.find(opt => opt.value === itemId)) {
      queryForm.value.itemIdList = []
      return
    }
  }
})
</script>

<template>
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden p-4">
    <MarkerFilter v-model="queryForm">
      <template #footer>
        <div class="w-full flex  justify-end">
          <el-button :disabled="!markerSelections.length" @click="handleBatchEdit">
            批量修改 {{ countSelections }}
          </el-button>
          <el-button type="danger" :disabled="!markerSelections.length">
            批量删除 {{ countSelections }}
          </el-button>
        </div>
      </template>
    </MarkerFilter>

    <MarkerTable v-model:selections="markerSelections" :marker-list="markerList" :loading="loading" />

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30]"
      :pager-count="5"
      class="flex justify-end items-center"
      background
    />

    <MarkerBatchEditor
      v-model:visible="multipleEditDialogVisible"
      v-model="batchEditForm"
      :selections="markerSelections"
      @submit="batchEditMarker"
    />
  </div>
</template>
