<script lang="ts" setup>
import { Delete, Edit, RefreshRight } from '@element-plus/icons-vue'
import { useIconTagDelete, useIconTagList } from './hooks'
import { IconTagCreator, IconTagEditor, IconTagFilter, IconTagTable } from './components'
import { PgUnit, useGlobalDialog, usePagination } from '@/hooks'

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

const selections = ref<API.TagVo[]>([])

const filterForm = ref({
  typeIdList: [] as number[],
  tagList: [] as string[],
})

const { iconTagList, userMap, loading, updateTagList } = useIconTagList({
  pagination,
  getParams: () => filterForm.value,
})

const { DialogService } = useGlobalDialog()
const getDialogConfig = (title: string) => ({
  title,
  width: 'fit-content',
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
})

// ==================== 创建图标标签 ====================
const openTagCreator = () => DialogService
  .config(getDialogConfig('添加标签'))
  .listeners({ success: updateTagList })
  .open(IconTagCreator)

// ==================== 编辑图标标签 ====================
const openTagEditor = (tag: API.TagVo) => DialogService
  .config(getDialogConfig(`编辑标签：${tag.tag}`))
  .props({ tag })
  .listeners({ success: updateTagList })
  .open(IconTagEditor)

// ==================== 删除图标标签 ====================
const { confirmDeleteTag, onSuccess: onDeleteSuccess } = useIconTagDelete()
onDeleteSuccess(updateTagList)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <IconTagFilter v-model="filterForm">
      <template #footer>
        <div class="w-full flex items-center justify-end">
          <el-button type="danger" :disabled="!selections.length" @click="() => confirmDeleteTag(selections)">
            批量删除 {{ selections.length ? ` ${selections.length} 项` : '' }}
          </el-button>
          <el-button type="primary" @click="openTagCreator">
            添加标签
          </el-button>
          <el-button :icon="RefreshRight" circle :loading="loading" @click="updateTagList" />
        </div>
      </template>
    </IconTagFilter>

    <IconTagTable
      v-model:selections="selections"
      :icon-tag-list="iconTagList"
      :user-map="userMap"
      :loading="loading"
    >
      <template #action="{ row }">
        <el-button :icon="Edit" @click="() => openTagEditor(row)" />
        <el-button type="danger" plain :icon="Delete" @click="() => confirmDeleteTag(row)" />
      </template>
    </IconTagTable>

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
      @current-change="updateTagList"
      @size-change="updateTagList"
    />
  </div>
</template>
