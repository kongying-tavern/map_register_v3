<script lang="ts" setup>
import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common'
import { useRoleEdit, useSelected, useUserList } from './hooks'
import { BtnCreateUser, TableCell, TableFilter, UserRoleTag, UserSorter } from './components'
import { usePagination } from '@/hooks'

export interface CustomTableColumn {
  title: AnyColumn['title']
  dataKey: AnyColumn['dataKey']
  width?: AnyColumn['width']
  readonly?: boolean
  fixed?: AnyColumn['fixed']
  minWidth?: number
}

const columns: CustomTableColumn[] = [
  { title: 'ID', dataKey: 'id', width: 100, readonly: true, fixed: true },
  { title: '用户名', dataKey: 'username', minWidth: 150, readonly: true, fixed: true },
  { title: '昵称', dataKey: 'nickname', minWidth: 150 },
  { title: 'QQ', dataKey: 'qq', width: 150 },
  { title: '电话', dataKey: 'phone', width: 200 },
]
const { pagination, layout } = usePagination()

const sortOptions = [
  { name: '昵称', field: 'nickname' },
  { name: '注册时间', field: 'createTime' },
]

const { userList, loading, deleteLoading, sorts, filterKey, filterValue, refresh, deleteRow } = useUserList({
  onSuccess: ({ total = 0 }) => {
    pagination.value.total = total
  },
  params: () => ({
    current: pagination.value.current,
    size: pagination.value.pageSize,
  }),
})

const { editLoading, isEditable, activeEdit, saveEdit, openPwdEditorDialog } = useRoleEdit({
  userList,
})

const { selected, selectedText, batchDeleteLoading, batchDelete, changeSelected } = useSelected({
  onBatchDeleteSuccess: refresh,
})
const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="flex flex-col">
      <div class="flex gap-8 items-center">
        <UserSorter v-model="sorts" :options="sortOptions" />
        <TableFilter v-model="filterValue" v-model:filter-key="filterKey" />
      </div>
      <div class="flex items-center justify-end gap-2">
        <div class="text-sm">
          {{ selectedText }}
        </div>
        <el-button type="danger" plain :disabled="!selected.length" :loading="batchDeleteLoading" @click="batchDelete">
          批量删除
        </el-button>
        <BtnCreateUser @success="refresh" />
      </div>
    </div>

    <div ref="tableRef" class="flex-1 overflow-hidden" :style="{ height: '50vh' }">
      <el-table
        v-loading="loading"
        element-loading-text="载入中..."
        :data="userList"
        :height="height"
        :border="true"
        class="user-table"
        @selection-change="changeSelected"
      >
        <el-table-column type="selection" />

        <el-table-column
          v-for="column in columns"
          :key="column.dataKey"
          :prop="column.dataKey"
          :label="column.title"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
        >
          <template #default="{ row, $index }">
            <TableCell
              v-model="row[column.dataKey ?? '']"
              :readonly="column.readonly"
              :edit-mode="isEditable($index)"
              @active="() => activeEdit($index)"
            />
          </template>
        </el-table-column>

        <el-table-column label="角色" prop="roleList" :width="230">
          <template #default="{ $index }">
            <UserRoleTag v-model="userList[$index].roleList" :edit-mode="isEditable($index)" @active="() => activeEdit($index)" />
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" :width="220">
          <template #default="{ $index }">
            <el-button v-if="isEditable($index)" :loading="editLoading" type="primary" plain size="small" @click.stop="saveEdit">
              保存
            </el-button>
            <el-button v-else :loading="deleteLoading" size="small" @click.stop="() => activeEdit($index)">
              编辑
            </el-button>
            <el-button size="small" @click="() => openPwdEditorDialog($index)">
              修改密码
            </el-button>
            <el-button type="danger" plain size="small" @click="() => deleteRow($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30, 40]"
      :pager-count="5"
      class="flex justify-end items-center"
      background
      @current-change="refresh"
      @size-change="refresh"
    />
  </div>
</template>

<style lang="scss" scoped>
.user-table {
  :deep(.el-table__cell) {
    padding: 6px 0;
  }
}
</style>
