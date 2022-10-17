<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common'
import { ElMessage } from 'element-plus'
import {
  // useSelected,
  useUserList,
} from './hooks'
import {
  TableCell,
  UserRoleTag,
} from './components'
import { usePagination } from '@/hooks'
import { messageFrom } from '@/utils'
import System from '@/api/system'

const columns: (AnyColumn & { readonly?: boolean })[] = [
  { title: 'ID', dataKey: 'id', width: 100, readonly: true },
  { title: '用户名', dataKey: 'username', width: 200, readonly: true },
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

// TODO: 还未完成迁移
// const { selected, getSelectedString, rowUpdate } = useSelected({
//   userList,
//   paginationParams,
// })

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

// TODO: 下面这一大坨准备抽离
const editLoading = ref(false)
const rowCache = ref<API.SysUserVo | null>(null)
const resetFlag = ref(true)
const _editIndex = ref(-1)
const editIndex = computed({
  get: () => _editIndex.value,
  set: (index) => {
    if (index !== -1) {
      rowCache.value = cloneDeep(userList.value[index])
      resetFlag.value = true
    }
    _editIndex.value = index
  },
})
useEventListener(window, 'click', () => {
  if (resetFlag.value && rowCache.value)
    userList.value[editIndex.value] = rowCache.value
  editIndex.value = -1
})
const saveEdit = async () => {
  if (editIndex.value === -1)
    return
  try {
    editLoading.value = true
    const { id, username, roleList, ...rest } = userList.value[editIndex.value]
    const res = await System.sysUserController.updateUser({}, {
      ...rest,
      userId: id,
    })
    resetFlag.value = false
    editIndex.value = -1
    ElMessage.success(res.message ?? '修改成功')
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
  finally {
    editLoading.value = false
  }
}
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
          <template #default="{ row, $index }">
            <TableCell
              v-model="row[column.dataKey ?? '']"
              :readonly="column.readonly"
              :edit-mode="editIndex === $index"
              @active="editIndex = $index"
            />
          </template>
        </el-table-column>

        <!-- TODO: 角色的编辑在另一个接口 -->
        <el-table-column label="角色" prop="roleList" :width="230">
          <template #default="{ $index }">
            <UserRoleTag v-model="userList[$index].roleList" :edit-mode="editIndex === $index" @active="editIndex = $index" />
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作">
          <template #default="{ $index }">
            <div class="flex">
              <el-button v-if="editIndex === $index" :loading="editLoading" @click.stop="saveEdit">
                保存
              </el-button>
              <el-button v-else @click.stop="editIndex = $index">
                编辑
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
