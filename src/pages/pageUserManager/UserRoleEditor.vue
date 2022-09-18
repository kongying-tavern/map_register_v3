<template>
  <UserRoleTag v-for="role in roleList" :key="role.id" :role="role" />
  <q-popup-edit v-slot="scope" v-model="roleList" fit :cover="false">
    <q-select
      v-model="scope.value"
      multiple
      counter
      :options="options"
      option-label="name"
      option-value="id"
    >
      <template #selected>
        <UserRoleTag v-for="role in roleList" :key="role.id" :role="role" />
      </template>
      <template #option="{ itemProps, opt, selected, toggleOption }">
        <q-item v-bind="itemProps">
          <q-item-section>
            <q-item-label>{{ opt.name }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              :model-value="selected"
              @update:model-value="
                () => updateUserRole(opt, selected, () => toggleOption(opt))
              "
            />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </q-popup-edit>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserData } from '@/api/system/user'
import UserRoleTag from './UserRoleTag.vue'
import type { RoleData } from '@/api/system/user/index'
import { assignUserRole, removeUserRole } from '@/api/system/role/index'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const props = defineProps<{
  user: UserData
  options: RoleData[]
}>()

const roleList = ref<RoleData[]>(props.user.roleList || [])
const updateUserRole = (
  opt: RoleData,
  selected: boolean,
  onSucceed: () => void,
) => {
  console.log(opt, selected)
  if (selected)
    removeUserRole(props.user.id, opt.id)
      .then(() => {
        onSucceed()
        roleList.value = roleList.value.filter((role) => role.id !== opt.id)
        $q.notify({
          type: 'positive',
          message: '用户角色更新成功！',
        })
      })
      .catch((err) => {
        console.error(err)
        $q.notify({
          type: 'negative',
          message: 'Update user role Error: ' + JSON.stringify(err),
        })
      })
  else
    assignUserRole(props.user.id, opt.id)
      .then(() => {
        onSucceed()
        roleList.value?.push(opt)
        $q.notify({
          type: 'positive',
          message: '用户角色更新成功！',
        })
      })
      .catch((err) => {
        console.error(err)
        $q.notify({
          type: 'negative',
          message: 'Update user role Error: ' + JSON.stringify(err),
        })
      })
}

defineExpose({
  updateUserRole,
  roleList,
})
</script>
