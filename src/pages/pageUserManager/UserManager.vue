<script lang="ts" setup>
import type { TableV2Props } from 'element-plus'
import {
  // useRoleOptions,
  // useSelected,
  useUserList,
} from './hooks'
import {
  UserRoleTag,
} from './components'

const columns: TableV2Props['columns'] = [
  { title: 'ID', dataKey: 'id', width: 100 },
  { title: '用户名', dataKey: 'username', width: 200 },
  { title: '昵称', dataKey: 'nickname', width: 230 },
  { title: 'QQ', dataKey: 'qq', width: 200 },
  { title: '电话', dataKey: 'phone', width: 200 },
  // { title: '角色', dataKey: 'roleList', width: 200 },
]

const {
  userList,
  // loading,
  // filterKey,
  // filterValue,
  // orderBy,
  // paginationParams,
  // refresh,
} = useUserList()

// const { roleOptions, rolesSort } = useRoleOptions()

// const { selected, getSelectedString, rowUpdate } = useSelected({
//   userList,
//   paginationParams,
// })

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <div ref="tableRef" class="flex-1">
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

        <el-table-column label="角色" prop="roleList" :width="230">
          <template #default="{ $index }">
            <UserRoleTag v-model="userList[$index].roleList" />
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" />
      </el-table>
    </div>

    <el-pagination
      :total="1000"
      class="flex justify-end items-center"
      background
      layout="total, sizes, prev, pager, next, jumper"
    />
  </div>
</template>
