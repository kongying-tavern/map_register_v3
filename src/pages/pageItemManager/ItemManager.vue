<script lang="ts" setup>
import { Delete, Edit } from '@element-plus/icons-vue'
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
const { itemList, loading: itemLoading, updateItemList } = useItemList({
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
const { openItemCreatorDialog, onSuccess: onCreateSuccess } = useItemCreate()
onCreateSuccess(updateItemList)

// ==================== 编辑物品 ====================
const { openItemEditorDialog, onSuccess: onEditSuccess } = useItemEdit()
onEditSuccess(updateItemList)

// ==================== 删除物品 ====================
const { handleDelete, onSuccess: onDeleteSuccess } = useItemDelete()
onDeleteSuccess(updateItemList)
</script>

<template>
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden text-orange-400">
    <ItemFilter v-model="queryForm">
      <template #footer>
        <div class="w-full flex items-center justify-end">
          <el-button
            type="danger"
            :disabled="!selection.length"
          >
            批量删除 {{ selection.length ? `: ${selection.length}` : '' }}
          </el-button>
          <el-button type="primary" @click="openItemCreatorDialog">
            添加物品
          </el-button>
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
