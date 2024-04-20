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
const { itemList, loading: itemLoading, userMap, updateItemList, resetCurrent } = useItemList({
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
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden p-4">
    <ItemFilter v-model="queryForm" @change="resetCurrent">
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
          <el-button type="primary" @click="openItemCreatorDialog">
            添加物品
          </el-button>
          <el-button :icon="RefreshRight" circle :loading="itemLoading" title="强制刷新" @click="updateItemList" />
        </div>
      </template>
    </ItemFilter>

    <ItemTable
      :item-list="itemList"
      :loading="itemLoading"
      :user-map="userMap"
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
          @click="() => confirmDelete(row)"
        />
      </template>
    </ItemTable>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30]"
      :pager-count="5"
      :disabled="itemLoading"
      class="flex justify-end items-center"
      background
      @current-change="updateItemList"
      @size-change="updateItemList"
    />
  </div>
</template>
