<template>
  <q-btn
    class="table_action_btn"
    outline
    color="negative"
    icon-right="mdi-trash-can-outline"
    :disable="!selected.length"
    :loading="loading"
    @click="
      () => {
        dialogVisible = true
        usersToDelete = selected
      }
    "
  >
    批量删除
  </q-btn>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="user_delete" style="min-width: 40rem">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">批量删除用户</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>
      <q-card-section>
        <p>是否确认删除以下{{ selected.length }} 个用户</p>
        <q-table
          class="user_delete_table"
          :loading="loading"
          hide-pagination
          :pagination="{
            page: 1,
            rowsPerPage: selected.length,
          }"
          :rows="usersToDelete"
          :columns="[
            {
              name: 'username',
              align: 'left',
              label: '用户名',
              field: 'username',
            },
            {
              name: 'nickname',
              align: 'left',
              label: '昵称',
              field: 'nickname',
            },
            { name: 'qq', align: 'left', label: 'qq', field: 'qq' },
            {
              name: 'roleList',
              align: 'left',
              label: '角色',
              field: 'roleList',
            },
          ]"
        >
          <template #body="props">
            <q-tr>
              <q-td key="username">
                {{ props.row.username }}
              </q-td>
              <q-td key="nickname">
                {{ props.row.nickname }}
              </q-td>
              <q-td key="qq">
                {{ props.row.qq }}
              </q-td>
              <q-td key="roleList">
                <UserRoleTag
                  v-for="role in props.row.roleList?.slice(0, 2)"
                  :key="role.id"
                  :role="role"
                />
                <q-chip
                  v-if="props.row.roleList && props.row.roleList?.length > 2"
                  square
                  outline
                  color="grey-6"
                  style="padding: 0.5em 0.3em"
                  :label="'+' + (props.row.roleList.length - 2)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn label="取消" @click="dialogVisible = false" />
        <q-btn label="确认" color="primary" @click="deleteSelectedUsers" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { deleteUser, UserData } from '@/api/system/user'
import UserRoleTag from './UserRoleTag.vue'
import { ref } from 'vue'

const props = defineProps<{
  selected: UserData[]
}>()
const dialogVisible = ref(false)
const usersToDelete = ref<UserData[]>([...props.selected])
const loading = ref(false)
const emit = defineEmits<{
  (e: 'refresh'): void
}>()
const deleteSelectedUsers = () => {
  const getDeleteSingleUserPromise = (id: number) => {
    return deleteUser(id).then((res) => {
      usersToDelete.value = usersToDelete.value.filter((item) => item.id !== id)
      return res
    })
  }

  Promise.all(
    props.selected.map((item) => getDeleteSingleUserPromise(item.id)),
  ).then((res) => {
    console.log(res)
    dialogVisible.value = false
    emit('refresh')
  })
}
</script>

<style scoped lang="scss">
.table_action_btn {
  margin-right: 8px;
}
.user_delete_table {
  max-height: 30rem;
}
</style>
