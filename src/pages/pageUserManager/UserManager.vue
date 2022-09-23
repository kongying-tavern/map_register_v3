<template>
  <q-table
    :ref="tableRef"
    v-model:pagination="paginationParams"
    v-model:selected="selected"
    :rows-per-page-options="[10, 20, 30, 50]"
    title="用户管理"
    class="user_table"
    dense
    :rows="rows"
    row-key="id"
    selection="multiple"
    :columns="columns"
    :loading="loading"
    :filter="filterValue"
    separator="vertical"
    :selected-rows-label="getSelectedString"
    @request="onRequest"
  >
    <template #top-right>
      <div class="table_actions">
        <UserDelete :selected="selected" @refresh="refreshTable" />
        <UserCreate @refresh="refreshTable" />
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
          @update:model-value="
            onRequest({
              pagination: { ...paginationParams, page: 1 },
              filter: filterValue,
            })
          "
        />
        <div class="search_group">
          <q-select
            v-model="filterKey"
            :options="['昵称', '用户名']"
            label="筛选项"
            borderless
          ></q-select>
          <q-input v-model="filterValue" debounce="800" placeholder="搜索">
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </template>

    <!-- Table Cell with Popup Edit -->
    <template #body-cell-id="props">
      <td>{{ props.row.id }}</td>
    </template>
    <template #body-cell-username="props">
      <td>
        <TableCell :row-data="props.row" field="username" @update="updateRow" />
      </td>
    </template>
    <template #body-cell-nickname="props">
      <td>
        <TableCell :row-data="props.row" field="nickname" @update="updateRow" />
      </td>
    </template>
    <template #body-cell-qq="props">
      <td>{{ props.row.qq }}</td>
    </template>
    <template #body-cell-phone="props">
      <td>
        <TableCell :row-data="props.row" field="phone" @update="updateRow" />
      </td>
    </template>
    <template #body-cell-roles="props">
      <td>
        <UserRoleEditor
          :user="{
              ...props.row, 
              roleList: props.row.roleList.sort((a: RoleData,b: RoleData)=>(a.sort-b.sort))
            }"
          :options="roleOptions"
          @update="rowUpdate"
        />
      </td>
    </template>
    <template #body-cell-actions="props">
      <td>
        <UserProfileEditor
          :user="props.row"
          @update="rowUpdate"
          @refresh="refreshPage"
        />
      </td>
    </template>
  </q-table>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import UserCreate from './UserCreate.vue'
import { UserData, fetchUserList, RoleData } from '@/api/system/user'
import { QTableProps, useQuasar } from 'quasar'
import UserRoleEditor from './UserRoleEditor.vue'
import { useRoleOptions } from './hooks'
import UserProfileEditor from './UserProfileEditor.vue'
import TableCell from './TableCell.vue'
import UserDelete from './UserDelete.vue'
type TableOrderOption =
  | 'nickname+'
  | 'createTime+'
  | 'nickname-'
  | 'createTime-'
const paginationParams = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
})

const columns = [
  { name: 'id', label: 'ID', align: 'left', required: true },
  { name: 'username', label: '用户名', align: 'left' },
  { name: 'nickname', label: '昵称', align: 'left' },
  { name: 'qq', label: 'QQ', align: 'left' },
  { name: 'phone', label: '电话', align: 'left' },
  { name: 'roles', label: '角色', align: 'left' },
  { name: 'actions', label: '操作', align: 'right' },
]
const tableRef = ref()
const rows = ref<UserData[]>([])
const selected = ref<UserData[]>([])
const loading = ref(false)
const orderBy = ref<TableOrderOption>('createTime-')
const filterKey = ref<'昵称' | '用户名'>('昵称')
const filterValue = ref('')
const roleOptions = ref<RoleData[]>([])

export default {
  components: {
    UserCreate,
    UserRoleEditor,
    UserProfileEditor,
    TableCell,
    UserDelete,
  },
  setup() {
    const $q = useQuasar()
    const onRequest = (props: QTableProps) => {
      const { pagination, filter } = props
      loading.value = true
      const searchKeyObj: any = {}
      if (filterValue.value !== '' && filterKey.value === '昵称')
        searchKeyObj['nickname'] = filter
      if (filterValue.value !== '' && filterKey.value === '用户名')
        searchKeyObj['username'] = filter
      fetchUserList({
        current: pagination?.page || 1,
        size: pagination?.rowsPerPage || 10,
        ...searchKeyObj,
        sort: [orderBy.value],
      })
        .then((res: any) => {
          loading.value = false
          if (res.code === 200) {
            rows.value.splice(0, rows.value.length, ...res.data.record)
            paginationParams.value = {
              rowsPerPage: 10,
              page: 1,
              sortBy: 'desc',
              descending: false,
              ...pagination,
              rowsNumber: res.data.total,
            }
            filterValue.value = filter
          } else {
            $q.notify({
              type: 'negative',
              message: res.message,
            })
            console.error(res)
          }
        })
        .catch((err) => {
          loading.value = false
          $q.notify({
            type: 'negative',
            message: 'fetch_user_list Error' + JSON.stringify(err),
          })
        })
    }
    onMounted(() => {
      onRequest({
        pagination: paginationParams.value,
        filter: filterValue.value,
      })
      useRoleOptions().then((res: { data: RoleData[] }) => {
        console.log(res)
        roleOptions.value = res.data.sort((a, b) => a.sort - b.sort)
      })
    })

    const rowUpdate = (data: UserData) => {
      rows.value = rows.value.map((row) => (row.id === data.id ? data : row))
    }
    const refreshTable = () => {
      onRequest({
        pagination: { ...paginationParams.value, page: 1 },
        filter: filterValue.value,
      })
    }
    const refreshPage = () => {
      onRequest({
        pagination: paginationParams.value,
        filter: filterValue.value,
      })
    }
    const getSelectedString = () => {
      return `已选择${selected.value.length}个用户, 共有 ${paginationParams.value.rowsNumber}个用户`
    }
    return {
      tableRef,
      columns,
      rows,
      orderBy,
      filterValue,
      filterKey,
      paginationParams,
      loading,
      onRequest,
      selected,
      roleOptions,
      rowUpdate,
      refreshTable,
      refreshPage,
      getSelectedString,
    }
  },
}
</script>

<style lang="scss">
.user_table {
  margin: 0 8px 8px;
  overflow: hidden;
  max-height: calc(100% - 8px);

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
