<script setup lang="ts">
import AnnouncementDialog from './components/AnnouncementDialog.vue'
import AnnouncementFilter from './components/AnnouncementFilter.vue'
import AnnouncementTable from './components/AnnouncementTable.vue'
import type { AnnouncementSearchParams } from './hooks'
import { useList } from './hooks'
import { usePagination } from '@/hooks'
import { DialogService } from '@/hooks/useGlobalDialog/dialogService'

const { pagination, layout } = usePagination()

// ==================== 搜索 ====================
const queryForm = ref<AnnouncementSearchParams>({
  channels: [],
  title: '',
})

const { getList, loading, mainTableData } = useList({
  pagination,
  getParams() {
    return queryForm.value
  },
})

const getDialogConfig = (title: string) => ({
  title,
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  width: '650px',
})

function handleCreate() {
  DialogService.config(getDialogConfig('新增公告')).listeners({ success: getList })
    .open(AnnouncementDialog)
}
</script>

<template>
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden flex">
    <AnnouncementFilter v-model:model-value="queryForm">
      <template #footer>
        <div class="w-full flex  justify-end">
          <el-button @click="handleCreate">
            新增
          </el-button>
        </div>
      </template>
    </AnnouncementFilter>
    <AnnouncementTable :data="mainTableData" :loading="loading" />
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30]"
      :pager-count="5"
      :disabled="loading"
      class="flex justify-end items-center"
      background
      @current-change="getList"
      @size-change="getList"
    />
  </div>
</template>
