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
        <div class="table_top_right">
          <div class="table_actions">
            <user-create />
            <user-import />
            <q-btn icon="refresh" @click="onRequest"></q-btn>
          </div>

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
                onRequest({ pagination: paginationParams, filter: filterValue })
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
        </div>
      </template>
    </q-table>

    <q-dialog v-model="dialogEditVisible" persistent>
      <q-card class="user_edit">
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
        <q-card-actions>
          <q-btn flat label="删除用户" style="color: red" @click="deleteUser" />
          <q-space />
          <q-btn label="取消" @click="dialogEditVisible = false" />
          <q-btn label="确认" color="primary" @click="editUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import UserCreate from './UserCreate.vue'
import UserImport from './UserImport.vue'
import {
  UserData,
  RoleData,
  fetch_user_list,
  update_user,
} from '@/api/system/user'
import { QTableProps } from 'node_modules/quasar/dist/types'
import { useQuasar } from 'quasar'
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
const dialogEditVisible = ref(false)
const formData = ref<UserData>({
  id: -1,
  nickname: '',
  username: '',
  phone: '',
  qq: '',
})
const loading = ref(false)
const orderBy = ref<TableOrderOption>('createTime-')
const filterKey = ref<'昵称' | '用户名'>('昵称')
const filterValue = ref('')
const onRequest = (props: QTableProps) => {
  const { pagination, filter } = props
  loading.value = true
  const searchKeyObj: any = {}
  if (filterValue.value !== '' && filterKey.value === '昵称')
    searchKeyObj['nickname'] = filter
  if (filterValue.value !== '' && filterKey.value === '用户名')
    searchKeyObj['username'] = filter
  fetch_user_list({
    current: pagination?.page || 1,
    size: pagination?.rowsPerPage || 10,
    ...searchKeyObj,
    sort: [orderBy.value],
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
    const $q = useQuasar()
    onMounted(() => {
      onRequest({
        pagination: paginationParams.value,
        filter: filterValue.value,
      })
    })
    const onClickEdit = (props: { row: UserData }) => {
      dialogEditVisible.value = true
      formData.value = { ...props.row }
    }
    const editUser = () => {
      console.log(formData.value)
      update_user(formData.value)
        .then((res: any) => {
          if (res.code === 200) {
            dialogEditVisible.value = false
            $q.notify({ type: 'positive', message: '修改成功' })
          }
        })
        .catch((err) => {
          console.log(err)
          $q.notify({ type: 'negative', message: JSON.stringify(err) })
        })
        .then(() => {
          onRequest({
            pagination: paginationParams.value,
            filter: filterValue.value,
          })
        })
    }
    const deleteUser = () => {
      console.log('deleteUser')
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
      onClickEdit,
      dialogEditVisible,
      formData,
      onRequest,
      editUser,
      deleteUser,
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
  min-width: 540px;

  thead tr:last-child th:last-child {
    background-color: #fff;
  }
  th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
  }
  .table_top_right {
    min-width: 400px;
    max-width: 60vw;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    .table_actions,
    .table_search {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      flex-wrap: wrap;
    }
    .table_search {
      min-width: 300px;
      margin-top: 16px;
      .search_group {
        display: flex;
      }
      .q-option-group {
        display: flex;
        flex-wrap: wrap;
        width: 220px;
        align-items: center;
        div {
          width: 115px;
        }
      }
      .q-select {
        width: 80px;
        margin: 0 8px 0 16px;
      }
      .q-input {
        max-width: 200px;
      }
    }
  }
}
.user_edit {
  min-width: 30rem;
  background: #fff;
  padding-bottom: 16px;
}
</style>
