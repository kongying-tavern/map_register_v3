<template>
  <div :key="displayCount" class="table_cell_content table_cell_roles">
    <UserRoleTag
      v-for="role in user.roleList?.slice(0, displayCount)"
      :key="role.id"
      :role="role"
    />
    <q-chip
      v-if="user.roleList && user.roleList?.length > displayCount"
      square
      outline
      color="grey-6"
      style="padding: 0.5em 0.3em"
      :label="'+' + (user.roleList.length - displayCount)"
    />
  </div>
  <q-popup-edit
    v-slot="scope"
    :model-value="user.roleList"
    fit
    anchor="top left"
  >
    <q-select
      v-model="scope.value"
      dense
      :options="options"
      option-label="name"
      option-value="id"
      @update:model-value="updateUserRole"
    >
      <template #selected>
        <div class="selected_roles">
          <UserRoleTag
            v-for="role in user.roleList"
            :key="role.id"
            :role="role"
          />
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
  </q-popup-edit>
</template>

<script setup lang="ts">
import { UserData } from '@/api/system/user'
import UserRoleTag from './UserRoleTag.vue'
import type { RoleData } from '@/api/system/user/index'
import { assignUserRole } from '@/api/system/role/index'
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { messageFrom } from '@/utils'
const $q = useQuasar()
const props = defineProps<{
  user: UserData
  options: RoleData[]
}>()

const displayCount = ref(1)
const emit = defineEmits<{
  (e: 'update', row: UserData): void
}>()

const updateUserRole = (opt: RoleData) => {
  assignUserRole(props.user.id, opt.id)
    .then((res: any) => {
      emit('update', { ...props.user, roleList: [opt] })
      $q.notify({
        type: 'positive',
        message: res.message,
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

<style scoped>
.table_cell_content.table_cell_roles {
  min-width: 180px;
}
</style>
