<script lang="ts" setup>
import { Delete, Edit, RefreshRight } from '@element-plus/icons-vue'
import type { ItemQueryForm } from './hooks'
import { useItemCreate, useItemDelete, useItemEdit, useItemList, useItemTable } from './hooks'
import { ItemFilter, ItemTable } from './components'
import { PgUnit, usePagination } from '@/hooks'

// ==================== 筛选信息 ====================
const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

const queryForm = ref<ItemQueryForm>({
  name: '',
  areaId: undefined,
  itemTypeId: undefined,
})

// ==================== 物品列表 ====================
const { itemList, loading: itemLoading, syncItemListChanged } = useItemList({
  pagination,
  getParams: () => ({
    name: queryForm.value.name,
    areaId: queryForm.value.areaId,
    itemTypeId: queryForm.value.itemTypeId,
  }),
})

// ==================== 物品表格 ====================
const { selection, handleSelectionChange } = useItemTable()

// ==================== 新增物品 ====================
const { openItemCreatorDialog, onSuccess: onCreateSuccess } = useItemCreate({
  isRoot: true,
})
onCreateSuccess(syncItemListChanged)

// ==================== 编辑物品 ====================
// TODO 批量编辑
const { openItemEditorDialog, onSuccess: onEditSuccess } = useItemEdit({
  isRoot: true,
})
onEditSuccess(syncItemListChanged)

// ==================== 删除物品 ====================
const { loading: deleteLoading, handleDelete, handleBatchDelete, onSuccess: onDeleteSuccess } = useItemDelete()
onDeleteSuccess(syncItemListChanged)
</script>

<template>
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden text-orange-400">
    <ItemFilter v-model="queryForm">
      <template #footer>
        <div class="w-full flex items-center justify-end">
          <el-button
            type="danger"
            :disabled="!selection.length"
            :loading="deleteLoading"
            @click="() => handleBatchDelete(selection)"
          >
            批量删除 {{ selection.length ? `: ${selection.length}` : '' }}
          </el-button>
          <el-button type="primary" @click="openItemCreatorDialog">
            添加物品
          </el-button>
          <el-button :icon="RefreshRight" circle :loading="itemLoading" title="强制刷新" @click="syncItemListChanged" />
        </div>
      </template>
    </ItemFilter>

    <ItemTable
      :item-list="itemList"
      :loading="itemLoading"
      @selection-change="handleSelectionChange"
    >
      <template #action="{ row }">
        <el-button
          plain
          :icon="Edit"
          @click="() => openItemEditorDialog(row)"
        />
        <el-button
          type="danger"
          plain
          :icon="Delete"
          @click="() => handleDelete(row)"
        />
      </template>
    </ItemTable>

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
~
