<template>
  <div class="user_table_container">
    <q-table
      :ref="tableRef"
      v-model:pagination="paginationParams"
      :rows-per-page-options="[10, 20, 30, 50]"
      title="角色管理"
      class="user_table"
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :filter="filterValue"
      row-key="charactor"
      dense
      @request="onRequest"
    >
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            dense
            round
            flat
            color="grey"
            icon="edit"
            @click="onClickEdit(props)"
          ></q-btn>
        </q-td>
      </template>

      <template #top-right>
        <q-select
          v-model="filterKey"
          :options="['昵称', '用户名']"
          label="筛选项"
          borderless
          style="min-width: 75px; margin-right: 8px"
        ></q-select>
        <q-input v-model="filterValue" debounce="300" placeholder="搜索">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
        <div class="table_actions">
          <user-create />
          <user-import />
          <q-btn icon="refresh" @click="onRequest"></q-btn>
        </div>
      </template>
    </q-table>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card class="user_editor">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">编辑用户</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-form>
            <q-input
              label="id"
              value=""
              :model-value="formData.id"
              disable
            ></q-input>
            <q-input v-model="formData.username" label="用户名"></q-input>
            <q-input v-model="formData.nickname" label="昵称"></q-input>
            <q-input v-model="formData.qq" label="qq"></q-input>
            <q-input v-model="formData.phone" label="电话"></q-input>
          </q-form>
        </q-card-section>
        <q-card-section>
          <q-btn label="取消" @click="dialogVisible = false" />
          <q-btn label="确认" color="primary" @click="editUser" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import UserCreate from './UserCreate.vue'
import UserImport from './UserImport.vue'
import { UserData, RoleData, fetch_user_list } from '@/api/system/user'
import { QTableProps } from 'node_modules/quasar/dist/types'

const paginationParams = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
})

const columns = [
  {
    name: 'id',
    required: true,
    label: 'ID',
    align: 'left',
    field: (row: UserData) => row.id,
    sortable: true,
  },
  {
    name: 'username',
    label: '用户名',
    align: 'left',
    field: (row: UserData) => row.username,
  },
  {
    name: 'nickname',
    label: '昵称',
    align: 'left',
    field: (row: UserData) => row.nickname,
  },
  { name: 'qq', label: 'qq', align: 'left', field: (row: UserData) => row.qq },
  {
    name: 'phone',
    label: '电话',
    align: 'left',
    field: (row: UserData) => row.phone,
    format: (val: string) => val || '-',
  },
  {
    name: 'roles',
    label: '角色',
    align: 'left',
    field: (row: UserData) => row.roleList?.items,
    format: (val: RoleData[]) => val?.length || '-',
  },
  { name: 'actions', label: '操作', align: 'center', field: '' },
]
const tableRef = ref()
const rows = ref<UserData[]>([])
const dialogVisible = ref(false)
const formData = ref({})
const loading = ref(false)
const filterKey = ref<'昵称' | '用户名'>('昵称')
const filterValue = ref('')
const onRequest = (props: QTableProps) => {
  const { pagination, filter } = props
  loading.value = true
  fetch_user_list({
    current: pagination?.page || 1,
    size: pagination?.rowsPerPage || 10,
    nickname: filterKey.value === '昵称' ? filter : '',
    username: filterKey.value === '用户名' ? filter : '',
    sort: [],
  }).then((res: any) => {
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
    }
  })
}

export default {
  components: { UserCreate, UserImport },
  setup() {
    onMounted(() => {
      onRequest({
        pagination: paginationParams.value,
        filter: filterValue.value,
      })
    })
    const onClickEdit = (props: { row: UserData }) => {
      dialogVisible.value = true
      formData.value = props.row
    }
    const editUser = () => {
      console.log(formData.value)
    }
    return {
      tableRef,
      columns,
      rows,
      filterValue,
      filterKey,
      paginationParams,
      loading,
      onClickEdit,
      dialogVisible,
      formData,
      onRequest,
      editUser,
    }
  },
}
</script>
<style scoped lang="scss">
.user_table_container {
  margin: 4rem;
}
.user_table {
  // max-width: 800px;
  min-width: 300px;

  thead tr:last-child th:last-child {
    background-color: #fff;
  }
  th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
  }
}
.user_editor {
  min-width: 30rem;
  background: #fff;

  button {
    margin: 1rem 1rem 0 0;
  }
}
</style>
