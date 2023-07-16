<script lang="ts" setup>
import { Delete, Edit, Lock } from '@element-plus/icons-vue'
import { useRoleList, useUserList } from './hooks'
import { UserCreator, UserEditor, UserFilter, UserPasswordEditor, UserTable } from './components'
import { useGlobalDialog, usePagination, useState } from '@/hooks'

const { DialogService } = useGlobalDialog()
const getDialogConfig = (title: string) => ({
  title,
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  width: 'fit-content',
})

const { roleList } = useRoleList()

const { pagination, layout } = usePagination()
const [sort, setSort] = useState<string[]>([])

const { userList, loading, filterKey, filterValue, updateUserList } = useUserList({
  pagination,
  getParams: () => ({
    nickname: '',
    username: '',
    sort: sort.value,
  }),
})

// ==================== 新增用户 ====================
const openUserCreator = () => DialogService
  .config(getDialogConfig('添加用户'))
  .listeners({ success: updateUserList })
  .open(UserCreator)

// ==================== 编辑用户 ====================
const openUserEditor = (data: API.SysUserVo) => DialogService
  .config(getDialogConfig(`编辑用户：${data.username}`))
  .props({ data, roleList })
  .listeners({ success: updateUserList })
  .open(UserEditor)

// ==================== 修改密码 ====================
const openPasswordEditor = (user: API.SysUserVo) => DialogService
  .config(getDialogConfig('修改密码'))
  .props({ user })
  .open(UserPasswordEditor)

// ==================== 批量删除 ====================
const [selections, setSelections] = useState<API.SysUserVo[]>([])
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <UserFilter v-model="filterValue" v-model:filter-key="filterKey">
      <template #footer>
        <el-button type="danger" :disabled="!selections.length">
          批量删除 {{ selections.length ? ` ${selections.length} 项` : '' }}
        </el-button>
        <el-button type="primary" @click="openUserCreator">
          添加用户
        </el-button>
      </template>
    </UserFilter>

    <UserTable :data="userList" :role-list="roleList" :loading="loading" @selection-change="setSelections" @sort-change="setSort">
      <template #action="{ row }">
        <el-button :icon="Edit" @click="() => openUserEditor(row)" />
        <el-button :icon="Lock" @click="() => openPasswordEditor(row)" />
        <el-button :icon="Delete" plain type="danger" />
      </template>
    </UserTable>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30]"
      :pager-count="5"
      class="flex justify-end items-center"
      background
      @current-change="updateUserList"
      @size-change="updateUserList"
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
