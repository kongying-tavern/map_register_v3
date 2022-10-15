<script lang="ts" setup>
import type { QTableColumn } from 'quasar'
import { useRoleOptions, useSelected, useUserList } from './hooks'
import {
  BtnCreateUser,
  BtnDeleteUser,
  BtnRoleManager,
  TableCell,
  UserPasswordReset,
  UserProfileEditor,
  UserRoleEditor,
} from './components'

const columns: QTableColumn[] = [
  { name: 'id', field: 'id', label: 'ID', align: 'center', required: true },
  { name: 'username', field: 'username', label: '用户名', align: 'center' },
  { name: 'nickname', field: 'nickname', label: '昵称', align: 'center' },
  { name: 'qq', field: 'qq', label: 'QQ', align: 'center' },
  { name: 'phone', field: 'phone', label: '电话', align: 'center' },
  { name: 'roles', field: 'roles', label: '角色', align: 'center' },
  { name: 'actions', field: 'actions', label: '操作', align: 'center' },
]

const {
  userList,
  loading,
  filterKey,
  filterValue,
  orderBy,
  paginationParams,
  refresh,
} = useUserList()

const { roleOptions, rolesSort } = useRoleOptions()

const { selected, getSelectedString, rowUpdate } = useSelected({
  userList,
  paginationParams,
})
</script>

<template>
  <q-table
    v-model:pagination="paginationParams"
    v-model:selected="selected"
    :rows-per-page-options="[10, 20, 30, 50]"
    title="用户管理"
    class="user_table"
    dense
    :rows="userList"
    row-key="id"
    selection="multiple"
    :columns="columns"
    :loading="loading"
    :filter="filterValue"
    separator="vertical"
    :selected-rows-label="getSelectedString"
    @request="refresh"
  >
    <template #top-right>
      <div class="table_actions">
        <BtnRoleManager
          :users="selected"
          :options="roleOptions"
          @update="rowUpdate"
        />
        <BtnDeleteUser :selected="selected" @refresh="refresh" />
        <BtnCreateUser @refresh="refresh" />
      </div>
    </template>
    <template #top-left>
      <div class="table_search">
        <q-option-group
          v-model="orderBy"
          dense
          title="排序"
          :options="[
            { label: '昵称升序', value: 'nickname+' },
            { label: '创建时间升序', value: 'createTime+' },
            { label: '昵称降序', value: 'nickname-' },
            { label: '创建时间降序', value: 'createTime-' },
          ]"
          @update:model-value="refresh"
        />
        <div class="search_group">
          <q-select
            v-model="filterKey"
            :options="[
              { label: '昵称', value: 'nickname' },
              { label: '用户名', value: 'username' },
            ]"
            label="筛选项"
            borderless
            @update:model-value="refresh"
          />
          <q-input v-model="filterValue" :debounce="800" placeholder="搜索">
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </template>

    <template #body-cell-username="props">
      <TableCell :row-data="props.row" field="username" readonly />
    </template>
    <template #body-cell-nickname="props">
      <TableCell :row-data="props.row" field="nickname" @update="rowUpdate" />
    </template>
    <template #body-cell-qq="props">
      <TableCell :row-data="props.row" field="qq" @update="rowUpdate" />
    </template>
    <template #body-cell-phone="props">
      <TableCell :row-data="props.row" field="phone" @update="rowUpdate" />
    </template>

    <template #body-cell-roles="props">
      <td class="q-table--col-auto-width">
        <UserRoleEditor
          :user="{
            ...props.row,
            roleList: props.row.roleList.sort(rolesSort),
          }"
          :options="roleOptions"
          @update="rowUpdate"
        />
      </td>
    </template>

    <template #body-cell-actions="props">
      <td>
        <UserPasswordReset
          :user="props.row"
          @update="rowUpdate"
          @refresh="refresh"
        />
        <UserProfileEditor
          :user="props.row"
          @update="rowUpdate"
          @refresh="refresh"
        />
      </td>
    </template>
  </q-table>
</template>

<style lang="scss" scoped>
.user_table {
  margin: 0 8px 8px;
  overflow: hidden;
  max-height: calc(100% - 8px);
  box-shadow: none;

  th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
    width: 64px;
    background: #fff;
  }
  .table_actions,
  .table_search {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    flex-wrap: wrap;
    margin: 8px 0;
  }
  .table_search {
    min-width: 180px;
    display: flex;
    .search_group {
      display: flex;
      padding-right: 8px;
      border-radius: 4px;

      .q-input {
        max-width: 280px;
        min-width: 120px;
        flex: 1;
      }
    }
    .q-option-group {
      display: flex;
      flex-wrap: wrap;
      width: 240px;
      align-items: center;
      margin: 8px 0;
    }
    .q-select {
      width: 80px;
      margin: 0 8px 0 16px;
    }
  }
}
</style>
