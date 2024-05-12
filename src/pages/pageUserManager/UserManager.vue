<script lang="ts" setup>
import { CirclePlus } from '@element-plus/icons-vue'
import { useRoleList, useUserList } from './hooks'
import { UserCreator, UserFilter, UserIntegratedPanel, UserTable } from './components'
import { PgUnit, useGlobalDialog, usePagination } from '@/hooks'

const { DialogService } = useGlobalDialog()
const getDialogConfig = () => ({
  alignCenter: true,
  showClose: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  width: 'fit-content',
})

const { roleList, roleMap } = useRoleList()

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.JUMPER, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

const {
  userList,
  loading,
  filterKey,
  filterValue,
  onSortChange,
  updateUserList,
  resetCurrent,
} = useUserList({ pagination })

// ==================== 新增用户 ====================
const openUserCreator = () => DialogService
  .config(getDialogConfig())
  .listeners({ success: updateUserList })
  .open(UserCreator)

// ==================== 编辑用户 ====================
const openUserEditor = (data: API.SysUserVo) => DialogService
  .config(getDialogConfig())
  .props({
    data,
    roleMap,
    roleList,
  })
  .listeners({
    success: updateUserList,
  })
  .open(UserIntegratedPanel)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <UserFilter v-model="filterValue" v-model:filter-key="filterKey" @change="resetCurrent">
      <template #footer>
        <el-button text :icon="CirclePlus" @click="openUserCreator">
          添加用户
        </el-button>
      </template>
    </UserFilter>

    <UserTable
      :data="userList"
      :role-list="roleList"
      :loading="loading"
      @view-row="openUserEditor"
      @sort-change="onSortChange"
    />

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="[10, 20, 30]"
      :pager-count="5"
      :disabled="loading"
      class="flex justify-end items-center p-2 pt-0"
      background
      @current-change="updateUserList"
      @size-change="updateUserList"
    />
  </div>
</template>
