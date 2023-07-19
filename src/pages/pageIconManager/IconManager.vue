<script lang="ts" setup>
import { Delete, Edit, RefreshRight } from '@element-plus/icons-vue'
import { useIconDelete, useIconList } from './hooks'
import { IconCreator, IconEditor, IconTable } from './components'
import { PgUnit, useGlobalDialog, usePagination } from '@/hooks'

const { DialogService } = useGlobalDialog()
const commonDialogConfig = {
  width: 'fit-content',
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
}

// ==================== 分页参数 ====================
const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

// ==================== 图标列表 ====================
const { iconList, userList, loading, updateIconList, updateIconListWithResetCurrent } = useIconList({
  pagination,
  getParams: () => ({
    creator: undefined,
    version: undefined,
    iconIdList: [],
    typeIdList: [],
  }),
})

// ==================== 添加图标 ====================
const openCreator = () => DialogService
  .config({
    ...commonDialogConfig,
    title: '添加图标',
  })
  .listeners({ success: updateIconList })
  .open(IconCreator)

// ==================== 图标编辑 ====================
const openEditor = (icon: API.IconVo) => DialogService
  .config({
    ...commonDialogConfig,
    title: `编辑图标：${icon.name}`,
  })
  .props({ icon })
  .open(IconEditor)

// ==================== 图标删除 ====================
const { confirmDeleteIcon, onSuccess: onDeleteSuccess } = useIconDelete()
onDeleteSuccess(updateIconList)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="flex justify-end">
      <el-form>
        <el-form-item>
          <el-button type="primary" @click="openCreator">
            添加图标
          </el-button>
          <el-button :icon="RefreshRight" circle :loading="loading" title="强制刷新" @click="updateIconList" />
        </el-form-item>
      </el-form>
    </div>

    <IconTable :icon-list="iconList" :user-list="userList" :loading="loading">
      <template #action="{ row }">
        <el-button
          plain
          :icon="Edit"
          @click="() => openEditor(row)"
        />
        <el-button
          type="danger"
          plain
          :icon="Delete"
          @click="() => confirmDeleteIcon(row)"
        />
      </template>
    </IconTable>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :disabled="loading"
      :total="pagination.total"
      :layout="layout"
      :pager-count="5"
      :page-sizes="[10, 20, 30]"
      background
      class="flex justify-end items-center"
      @current-change="updateIconList"
      @size-change="updateIconListWithResetCurrent"
    />
  </div>
</template>
