<script lang="ts" setup>
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
const { itemList, loading: itemLoading, userMap, updateItemList, resetCurrent } = useItemList({
  pagination,
  getParams: () => toValue(queryForm),
})

// ==================== 物品表格 ====================
const { selection, handleSelectionChange } = useItemTable()

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
const { loading: deleteLoading, confirmDelete, onSuccess: onDeleteSuccess } = useItemDelete()
onDeleteSuccess(updateItemList)
</script>

<template>
  <div class="h-full flex-1 flex flex-col overflow-hidden">
    <ItemFilter
      v-model="queryForm"
      @change="resetCurrent"
      @create="openItemCreatorDialog"
    >
      <template #footer>
        <div class="w-full flex items-center justify-end">
          <el-button
            type="danger"
            :disabled="!selection.length"
            :loading="deleteLoading"
            @click="() => confirmDelete(selection)"
          >
            批量删除 {{ selection.length ? ` ${selection.length} 项` : '' }}
          </el-button>
          <el-button text @click="openItemCreatorDialog">
            添加物品
          </el-button>
        </div>
      </template>
    </ItemFilter>

    <ItemTable
      :item-list="itemList"
      :loading="itemLoading"
      :user-map="userMap"
      @selection-change="handleSelectionChange"
      @review="openItemEditorDialog"
      @delete="confirmDelete"
    />

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30]"
      :pager-count="5"
      :disabled="itemLoading"
      class="flex justify-end items-center p-2"
      background
      @current-change="updateItemList"
      @size-change="updateItemList"
    />
  </div>
</template>
