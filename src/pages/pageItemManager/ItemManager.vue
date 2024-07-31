<script lang="ts" setup>
import type { ItemQueryForm } from './hooks'
import { ExplorerType } from './shared'
import { useItemCreate, useItemEdit, useItemList } from './hooks'
import { ItemDeleteConfirm, ItemFilter, ItemGridExplorer, ItemTable } from './components'
import { PgUnit, useGlobalDialog, usePagination } from '@/hooks'
import { ManagerModule } from '@/shared'

// ==================== 筛选信息 ====================
const { pagination, layout, onChange: onPaginationChange } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
  module: ManagerModule.Item,
})

const queryForm = ref<ItemQueryForm>({
  name: '',
  areaId: undefined,
  itemTypeId: undefined,
})

// ==================== 物品列表 ====================
const { itemList, loading: itemLoading, userMap, updateItemList, resetCurrent } = useItemList({
  pagination,
  getParams: () => toValue(queryForm),
})

onPaginationChange(updateItemList)

// ==================== 物品表格 ====================
const explorerType = ref<ExplorerType>(ExplorerType.Grid)

// ==================== 新增物品 ====================
const { openItemCreatorDialog, onSuccess: onCreateSuccess } = useItemCreate({
  isRoot: true,
})
onCreateSuccess(updateItemList)

// ==================== 编辑物品 ====================
// TODO 批量编辑
const { openItemEditorDialog, onSuccess: onEditSuccess } = useItemEdit({
  isRoot: true,
})
onEditSuccess(updateItemList)

// ==================== 删除物品 ====================

const { DialogService } = useGlobalDialog()

const confirmDelete = (item: API.ItemVo) => DialogService
  .config({
    alignCenter: true,
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
  })
  .props({
    item,
  })
  .listeners({
    success: updateItemList,
  })
  .open(ItemDeleteConfirm)
</script>

<template>
  <div class="h-full flex-1 flex flex-col overflow-hidden">
    <ItemFilter
      v-model="queryForm"
      v-model:explorer-type="explorerType"
      @change="resetCurrent"
      @create="openItemCreatorDialog"
    />

    <ItemTable
      v-if="explorerType === ExplorerType.List"
      :item-list="itemList"
      :loading="itemLoading"
      :user-map="userMap"
      @review="openItemEditorDialog"
      @delete="confirmDelete"
    />

    <ItemGridExplorer
      v-else-if="explorerType === ExplorerType.Grid"
      :item-list="itemList"
      :loading="itemLoading"
      :user-map="userMap"
      @review="openItemEditorDialog"
      @delete="confirmDelete"
    />

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="pagination.sizes"
      :pager-count="5"
      :disabled="itemLoading"
      class="flex justify-end items-center p-2"
      background
    />
  </div>
</template>
