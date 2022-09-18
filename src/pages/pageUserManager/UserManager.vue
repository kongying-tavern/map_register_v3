<template>
  <div class="user_table_container">
    <q-table
      :ref="tableRef"
      v-model:pagination="paginationParams"
      :rows-per-page-options="[10, 20, 30, 50]"
      title="用户管理"
      class="user_table"
      dense
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :filter="filterValue"
      separator="vertical"
      row-key="charactor"
      @request="onRequest"
    >
      <template #top-right>
        <div class="table_actions">
          <UserCreate />
          <UserImport />
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

      <!-- Table Popup Edit -->
      <template #body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="username" :props="props">
            {{ props.row.username }}
            <q-popup-edit
              v-slot="scope"
              v-model="props.row.username"
              buttons
              :cover="false"
              @save="(val: string) => editUser({...props.row, username: val})"
            >
              <q-input v-model="scope.value" type="text" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="nickname" :props="props">
            <div class="text-pre-wrap">{{ props.row.nickname }}</div>
            <q-popup-edit
              v-slot="scope"
              v-model="props.row.nickname"
              buttons
              :cover="false"
              @save="(val: string) => editUser({...props.row, nickname: val})"
            >
              <q-input v-model="scope.value" type="text" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="qq" :props="props">
            {{ props.row.qq }}
            <q-popup-edit
              v-slot="scope"
              v-model="props.row.qq"
              buttons
              :cover="false"
              @save="(val: string) => editUser({...props.row, qq: val})"
            >
              <q-input v-model="scope.value" type="number" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="phone" :props="props">
            <div class="text-pre-wrap">{{ props.row.phone }}</div>
            <q-popup-edit
              v-slot="scope"
              v-model="props.row.phone"
              buttons
              :cover="false"
              @save="(val: string) => editUser({...props.row, phone: val})"
            >
              <q-input v-model="scope.value" type="number" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="roles" :props="props" style="width: 240px">
            <UserRoleEditor :user="props.row" :options="roleOptions" />
          </q-td>
          <q-td key="actions" :props="props">
            <q-btn
              dense
              round
              flat
              color="grey"
              icon="edit"
              @click="onClickEdit(props)"
            ></q-btn>
          </q-td>
        </q-tr>
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
          <q-btn
            flat
            label="删除用户"
            style="color: red"
            @click="onClickDeleteUser"
          />
          <q-space />
          <q-btn label="取消" @click="dialogEditVisible = false" />
          <q-btn
            label="确认"
            color="primary"
            @click="() => editUser(formData)"
          />
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
  fetchUserList,
  updateUser,
  deleteUser,
  RoleData,
} from '@/api/system/user'
import { QTableProps, useQuasar } from 'quasar'
import UserRoleEditor from './UserRoleEditor.vue'
import { useRoleOptions } from './hooks'
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
const roleOptions = ref<RoleData[]>([])

export default {
  components: { UserCreate, UserImport, UserRoleEditor },
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
      useRoleOptions().then((res) => {
        roleOptions.value = res
      })
    })
    const onClickEdit = (props: { row: UserData }) => {
      dialogEditVisible.value = true
      formData.value = { ...props.row }
    }
    const editUser = (data: UserData) => {
      updateUser(data)
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
    const onClickDeleteUser = () => {
      const userData = formData.value
      $q.dialog({
        title: '删除用户',
        message: `确认删除用户
                  [ID] ${userData.id}
                  [username] ${userData.username}
                  [nickname] ${userData.nickname} ?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        deleteUser(userData.id)
          .then((res: any) => {
            if (res.code === 200)
              $q.notify({
                type: 'positive',
                message: `成功删除用户
                  [ID] ${userData.id}
                  [username] ${userData.username}
                  [nickname] ${userData.nickname} `,
              })
          })
          .catch((err: any) => {
            console.log(err)
            $q.notify({ type: 'negative', message: JSON.stringify(err) })
          })
          .then(() => {
            dialogEditVisible.value = false
            onRequest({
              pagination: paginationParams.value,
              filter: filterValue.value,
            })
          })
      })
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
      onClickDeleteUser,
      roleOptions,
    }
  },
}
</script>

<style scoped lang="scss">
.user_table_container {
  padding: 1rem;
}

.user_table {
  overflow: hidden;

  thead tr:last-child th:last-child {
    background-color: #fff;
  }
  th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 1;
    width: 64px;
  }
  .q-table__control {
    width: 100% !important;
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
      // border: 1px solid#cfcfcf;
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
.user_edit {
  min-width: 30rem;
  background: #fff;
  padding-bottom: 16px;
}
</style>
