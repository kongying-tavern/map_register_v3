<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import AnnouncementDialog from './components/AnnouncementDialog.vue'
import AnnouncementFilter from './components/AnnouncementFilter.vue'
import AnnouncementTable from './components/AnnouncementTable.vue'
import type { AnnouncementSearchParams } from './hooks'
import { useList } from './hooks'
import { DialogService } from '@/hooks/useGlobalDialog/dialogService'
import { usePagination } from '@/hooks'
import api from '@/api/api'

const { pagination, layout } = usePagination()

// ==================== 搜索 ====================
const queryForm = ref<AnnouncementSearchParams>({
  channels: [],
  title: '',
  sort: ['validTimeStart-'],
})

const { getList, loading, mainTableData } = useList({
  pagination,
  getParams() {
    return queryForm.value
  },
})

const getDialogConfig = () => ({
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  width: 'auto',
})

// 新增公告 打开弹窗
function handleCreate() {
  DialogService
    .config(getDialogConfig())
    .props({
      form: {},
      status: 'create',
    })
    .listeners({ success: getList })
    .open(AnnouncementDialog)
}

// 更新公告 打开弹窗
function handleUpdate(form?: API.NoticeVo) {
  DialogService
    .config(getDialogConfig())
    .props({
      form,
      status: 'update',
    })
    .listeners({ success: getList })
    .open(AnnouncementDialog)
}

// 删除公告
function handleRemove(form?: API.NoticeVo) {
  ElMessageBox.confirm(
    '是否确认删除公告?',
    '确认?',
    {
      type: 'warning',
    },
  ).then(() => {
    return api.notice.deleteNotice({ noticeId: form?.id as number })
  }).then(() => {
    ElMessage.success({ message: '删除公告成功' })
    getList()
  })
}
</script>

<template>
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden p-4">
    <AnnouncementFilter v-model:model-value="queryForm">
      <template #footer>
        <div class="w-full flex  justify-end">
          <el-button @click="handleCreate">
            新增
          </el-button>
        </div>
      </template>
    </AnnouncementFilter>
    <AnnouncementTable
      v-model:model-value="queryForm"
      :data="mainTableData"
      :loading="loading"
      @update="handleUpdate"
      @remove="handleRemove"
    />
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
