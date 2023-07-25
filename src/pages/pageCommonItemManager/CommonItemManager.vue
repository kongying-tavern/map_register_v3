<script lang="tsx" setup>
import { Delete, RefreshRight } from '@element-plus/icons-vue'
import { useCommonItemDelete, useCommonItemList } from './hooks'
import { CommonItemSelector, CommonItemTable } from './components'
import { PgUnit, useGlobalDialog, usePagination, useState } from '@/hooks'

const { DialogService } = useGlobalDialog()
const [selections, setSelections] = useState<API.ItemAreaPublicVo[]>([])

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

// ==================== 物品模板列表 ====================
const { itemList, loading, userMap, updateCommonItemList } = useCommonItemList({ pagination })

// ==================== 删除物品模板 ====================
const { confirmDelete, onSuccess: onDeleteSuccess } = useCommonItemDelete()
onDeleteSuccess(updateCommonItemList)

// ==================== 添加物品模板 ====================
const openCommonItemSelector = () => DialogService
  .config({
    width: 'fit-content',
    alignCenter: true,
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
  })
  .listeners({ success: updateCommonItemList })
  .open(CommonItemSelector)
</script>

<template>
  <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden">
    <div class="w-full flex items-center justify-end" style="padding-bottom: 18px;">
      <el-button type="danger" :disabled="!selections.length" @click="() => confirmDelete(selections)">
        从公共物品删除 {{ selections.length ? ` ${selections.length} 项` : '' }}
      </el-button>
      <el-button type="primary" @click="openCommonItemSelector">
        添加到公共物品
      </el-button>
      <el-button :loading="loading" :icon="RefreshRight" circle @click="updateCommonItemList" />
    </div>

    <CommonItemTable
      :item-list="itemList"
      :loading="loading"
      :user-map="userMap"
      @selection-change="setSelections"
    >
      <template #action="{ row }">
        <el-button plain type="danger" :icon="Delete" @click="() => confirmDelete(row)" />
      </template>
    </CommonItemTable>

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
      @current-change="updateCommonItemList"
      @size-change="updateCommonItemList"
    />
  </div>
</template>
