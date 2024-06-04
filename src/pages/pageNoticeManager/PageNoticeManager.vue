<script setup lang="ts">
import { useNoticeList } from './hooks'
import { NoticeDeleteConfirm, NoticeHeader, NoticeTable, NoticeViewer } from './components'
import { PgUnit, useGlobalDialog, usePagination } from '@/hooks'
import { NoticeChannel } from '@/shared'

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.JUMPER, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
  init: {
    current: 1,
    pageSize: 20,
    total: 0,
  },
})

const filterParams = ref<Omit<API.NoticeSearchVo, 'current' | 'size'>>({
  channels: [
    NoticeChannel.APPLICATION,
    NoticeChannel.CLIENT_APP,
    NoticeChannel.CLIENT_PC,
    NoticeChannel.COMMON,
    NoticeChannel.DADIAN,
    NoticeChannel.DASHBOARD,
    NoticeChannel.TIANLI,
    NoticeChannel.WEB,
  ],
  getValid: undefined,
  sort: ['validTimeStart-'],
  title: '',
  transformer: '',
})

const { noticeList, loading, refresh } = useNoticeList({
  pagination,
  getParams: () => toValue(filterParams),
})

const { DialogService } = useGlobalDialog()

const SHARED_CONFIG = {
  alignCenter: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
}

const handleCreateNotice = () => {
  DialogService
    .config({
      ...SHARED_CONFIG,
    })
    .props({
      status: 'create',
    })
    .listeners({
      success: refresh,
    })
    .open(NoticeViewer)
}

const handleReviewNotice = (notice: API.NoticeVo) => {
  DialogService
    .config({
      ...SHARED_CONFIG,
    })
    .props({
      notice,
      status: 'update',
    })
    .listeners({
      success: refresh,
    })
    .open(NoticeViewer)
}

const handleDeleteNotice = (notice: API.NoticeVo) => {
  DialogService
    .config({
      ...SHARED_CONFIG,
    })
    .props({
      title: '删除公告',
      notice,
    })
    .listeners({
      success: refresh,
    })
    .open(NoticeDeleteConfirm)
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <NoticeHeader
      v-model="filterParams"
      v-model:pagination="pagination"
      :data="1"
      @change="refresh"
      @create="handleCreateNotice"
    />

    <NoticeTable
      :data="noticeList"
      :loading="loading"
      @review="handleReviewNotice"
      @delete="handleDeleteNotice"
    />

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30, 40]"
      :pager-count="5"
      :disabled="loading"
      class="flex justify-end items-center p-2"
      background
      @current-change="refresh"
      @size-change="refresh"
    />
  </div>
</template>
