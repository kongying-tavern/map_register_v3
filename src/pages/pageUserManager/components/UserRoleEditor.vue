<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import UserRoleTag from './UserRoleTag.vue'
import System from '@/api/system'
import { messageFrom } from '@/utils'

const props = defineProps<{
  user: API.SysUserVo
  options: API.SysRoleVo[]
}>()
const emits = defineEmits<{
  (e: 'update', row: API.SysUserVo): void
}>()

const displayCount = ref(1)

const updateUserRole = async (opt: API.SysRoleVo) => {
  try {
    const res = await System.role.addRoleToUser({
      userId: props.user.id,
      roleId: opt.id,
    })
    ElMessage.success(res.message ?? '成功')
    emits('update', { ...props.user, roleList: [opt] })
  }
  catch (err) {
    ElMessage.error(messageFrom(err))
  }
}
</script>

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
      :label="`+${user.roleList.length - displayCount}`"
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

<style scoped>
.table_cell_content.table_cell_roles {
  min-width: 180px;
}
</style>
