<script lang="ts" setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import UsersPreview from './UsersPreviewTable.vue'
import UserRoleTag from './UserRoleTag.vue'
import System from '@/api/system'
import { messageFrom } from '@/utils'
const props = defineProps<{
  users: API.SysUserVo[]
  options: API.SysRoleVo[]
}>()
const emit = defineEmits<{
  (e: 'update', user: API.SysUserVo): void
}>()
const previewData = ref<API.SysUserVo[]>(props.users)

const displayValue = ref<API.SysRoleVo>()
const dialogVisible = ref(false)

const $q = useQuasar()

const updateUserRole = (role: API.SysRoleVo) => {
  const usersToUpdate = props.users.filter(user =>
    user.roleList?.find(roleItem => role.id === roleItem.id),
  )
  Promise.all(
    usersToUpdate.map(user =>
      System.role.addRoleToUser({
        userId: user.id,
        roleId: role.id,
      }),
    ),
  )
    .then(() => {
      props.users.forEach(user =>
        emit('update', { ...user, roleList: [role] }),
      )
      previewData.value = previewData.value.map(user => ({
        ...user,
        roleList: [role],
      }))
      $q.notify({
        type: 'positive',
        message: '成功',
      })
    })
    .catch((err) => {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: messageFrom(err),
      })
    })
}
</script>

<template>
  <q-btn
    class="table_action_btn"
    outline
    icon-right="mdi-account-cog-outline"
    :disable="!users.length"
    style="margin-left: 8px"
    @click="
      () => {
        dialogVisible = true
        previewData = users
      }
    "
  >
    配置角色
    <q-dialog v-model="dialogVisible">
      <q-card class="user_delete" style="min-width: 40rem">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            批量配置用户角色
          </div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="displayValue"
            label="用户角色"
            dense
            :options="options"
            option-label="name"
            option-value="id"
            style="width: 240px; margin-bottom: 16px"
            @update:model-value="updateUserRole"
          >
            <template #selected>
              <div class="selected_roles">
                <UserRoleTag v-if="displayValue" :role="displayValue" />
              </div>
            </template>
            <template #option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <q-item-label>
                    <UserRoleTag :role="opt" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <UsersPreview :users="previewData" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
</template>
