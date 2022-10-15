<script lang="ts" setup>
import UserRoleTag from './UserRoleTag.vue'
defineProps<{
  users: API.SysUserVo[]
}>()
</script>

<template>
  <q-table
    class="user_delete_table"
    hide-pagination
    :pagination="{
      page: 1,
      rowsPerPage: users.length,
    }"
    :rows="users"
    :columns="[
      {
        name: 'id',
        align: 'left',
        label: 'ID',
        field: 'id',
      },
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
        <q-td key="id">
          {{ props.row.id }}
        </q-td>
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
            v-for="role in props.row.roleList"
            :key="role.id"
            :role="role"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
