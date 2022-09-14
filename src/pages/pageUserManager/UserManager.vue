<template>
  <div class="user_table_container">
    <q-table
      v-model:pagination="paginationParams"
      :rows-per-page-options="[10, 20, 30, 50]"
      title="角色管理"
      class="user_table"
      :rows="rows"
      :columns="columns"
      row-key="charactor"
      dense
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
        <div class="table_actions">
          <user-create />
          <user-import />
          <q-btn icon="refresh" @click="refreshTable"></q-btn>
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
              :model-value="formData.userId"
              disable
            ></q-input>
            <q-input v-model="formData.username" label="用户名"></q-input>
            <q-input v-model="formData.nickName" label="昵称"></q-input>
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
import { fetch_user_list } from '@/api/user'
import { onMounted, ref } from 'vue'
import UserCreate from './UserCreate.vue'
import UserImport from './UserImport.vue'
import { UserData, RoleData } from '@/api/user'

// const initialPagination = {
//   sortBy: 'desc',
//   descending: false,
//   rowsPerPage: 20,
// }
const paginationParams = ref({
  page: 1,
  rowsPerPage: 20,
})

const columns = [
  {
    name: 'id',
    required: true,
    label: 'ID',
    align: 'left',
    field: (row: UserData) => row.userId,
    sortable: true,
  },
  { name: 'username', label: '用户名', field: (row: UserData) => row.username },
  { name: 'nickname', label: '昵称', field: (row: UserData) => row.nickName },
  { name: 'qq', label: 'qq', field: (row: UserData) => row.qq },
  { name: 'phone', label: '电话', field: (row: UserData) => row.phone },
  {
    name: 'roles',
    label: '角色',
    field: (row: UserData) => row.roleList?.items,
    format: (val: RoleData[]) => val?.length || '-',
    sortable: true,
  },
  { name: 'actions', label: '操作', align: 'center', field: '' },
  // { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
  // { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
]
const rows = [
  {
    userId: '1',
    username: 'test',
    nickName: '用户昵称',
    qq: '789456123',
    phone: '',
  },
  {
    userId: '2',
    username: 'test',
    nickName: '用户昵称',
    qq: '789456123',
    phone: '',
  },
  {
    userId: '3',
    username: 'test',
    nickName: '用户昵称',
    qq: '789456123',
    phone: '',
    roleList: {
      items: [
        {
          id: 123,
          name: '可莉',
          code: 'KLEE',
          sort: 9999,
        },
      ],
    },
  },
]
const refreshTable = () => {
  fetch_user_list({ current: 1, size: 20 })
}
onMounted(() => {
  refreshTable()
})
export default {
  components: { UserCreate, UserImport },
  setup() {
    const dialogVisible = ref(false)
    const formData = ref({})
    const onClickEdit = (props: { row: UserData }) => {
      dialogVisible.value = true
      formData.value = props.row
    }
    const editUser = () => {
      console.log(formData.value)
    }
    return {
      columns,
      rows,
      paginationParams,
      onClickEdit,
      dialogVisible,
      formData,
      refreshTable,
      editUser,
    }
  },
}
</script>
<style scoped lang="scss">
.user_table_container {
  margin: 4rem;
}
.table_actions button {
  margin: 0 0.5rem;
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
