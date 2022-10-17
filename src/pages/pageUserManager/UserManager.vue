<script lang="ts" setup>
import type { TableV2Props } from 'element-plus'
import {
  // useSelected,
  useUserList,
} from './hooks'
import {
  UserRoleTag,
} from './components'
import { usePagination } from '@/hooks'

const columns: TableV2Props['columns'] = [
  { title: 'ID', dataKey: 'id', width: 100 },
  { title: '用户名', dataKey: 'username', width: 200 },
  { title: '昵称', dataKey: 'nickname', width: 230 },
  { title: 'QQ', dataKey: 'qq', width: 200 },
  { title: '电话', dataKey: 'phone', width: 200 },
]

const { pagination, layout } = usePagination()

const { userList, /* loading, filterKey, filterValue, orderBy, */refresh } = useUserList({
  onSuccess: ({ total = 0 }) => {
    pagination.value.total = total
  },
  params: () => ({
    current: pagination.value.current,
    size: pagination.value.pageSize,
  }),
})

// const { selected, getSelectedString, rowUpdate } = useSelected({
//   userList,
//   paginationParams,
// })

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

const editIndex = ref(-1)
useEventListener(window, 'click', () => {
  editIndex.value = -1
})
</script>

<template>
  <div class="h-full flex flex-col gap-4 overflow-hidden">
    <div ref="tableRef" class="flex-1" :style="{ height: '50vh' }">
      <el-table
        :data="userList"
        :height="height"
      >
        <el-table-column
          v-for="column in columns"
          :key="column.dataKey"
          :prop="column.dataKey"
          :label="column.title"
          :width="column.width"
        >
          <template #default="{ row }">
            {{ row[column.dataKey ?? ''] ?? '--' }}
          </template>
        </el-table-column>

        <el-table-column label="角色" prop="roleList" :width="220">
          <template #default="{ $index }">
            <UserRoleTag v-model="userList[$index].roleList" :edit-mode="editIndex === $index" @active="editIndex = $index" />
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作">
          <template #default="{ $index }">
            <div class="flex">
              <el-button v-if="editIndex === $index" size="small" @click.stop="">
                保存
              </el-button>
            </div>
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
