<script lang="ts" setup>
import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common'
import { useUserList as useAreaList, useRoleEdit, useSelected } from './hooks'
import { BtnCreateArea, TableCell } from './components'
import { usePagination } from '@/hooks'

export interface CustomTableColumn {
  title: AnyColumn['title']
  dataKey: string
  width?: AnyColumn['width']
  readonly?: boolean
  fixed?: AnyColumn['fixed']
  minWidth?: number
}

/** 表格列 */
const columns: CustomTableColumn[] = [
  { title: 'ID', dataKey: 'id', width: 100, readonly: true, fixed: true },
  { title: '地区排序', dataKey: 'sortIndex', width: 100, readonly: true, fixed: true },
  { title: '图标', dataKey: 'iconTag', width: 75 },
  { title: '地区名称', dataKey: 'name', minWidth: 100 },
  { title: '地区代码', dataKey: 'code', minWidth: 100 },
  { title: '父级地区ID', dataKey: 'parentId', width: 100 },
  { title: '隐藏标志', dataKey: 'hiddenFlag', width: 100 },
]

/** 分页 */
const { pagination, layout } = usePagination()

const { areaList, parents, loading, params, deleteLoading, refresh, deleteRow } = useAreaList({
  pagination,
  onSuccess: (area) => {
    pagination.value.total = area.length
  },
})

/** 表格行编辑 */
const { editLoading, isEditable, activeEdit, saveEdit } = useRoleEdit({
  areaList,
})

const { selected, selectedText, batchDeleteLoading, batchDelete, changeSelected } = useSelected({
  onBatchDeleteSuccess: refresh,
})

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="flex flex-col gap-2">
      <div class="flex gap-8 items-center">
        <div class="text-sm">
          选择地区：
        </div>
        <el-select v-model="params.parentId" placeholder="选择地区" style="width: 200px">
          <el-option
            label="无"
            :value="-1"
          />
          <el-option
            v-for="area in parents"
            :key="area.id"
            :label="area.name"
            :value="area.id ?? -1"
          />
        </el-select>
      </div>
      <div class="flex items-center justify-end gap-2">
        <div class="text-sm">
          {{ selectedText }}
        </div>
        <el-button type="danger" plain :disabled="!selected.length" :loading="batchDeleteLoading" @click="batchDelete">
          批量删除
        </el-button>
        <BtnCreateArea :arealist="areaList" @success="refresh" />
      </div>
    </div>

    <div ref="tableRef" class="flex-1 overflow-hidden" :style="{ height: '50vh' }">
      <el-table
        v-loading="loading"
        element-loading-text="载入中..."
        :data="areaList"
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

        <el-table-column fixed="right" label="操作" :width="220">
          <template #default="{ $index }">
            <el-button v-if="isEditable($index)" :loading="editLoading" type="primary" plain size="small" @click.stop="saveEdit">
              保存
            </el-button>
            <el-button v-else :loading="deleteLoading" size="small" @click.stop="() => activeEdit($index)">
              编辑
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
