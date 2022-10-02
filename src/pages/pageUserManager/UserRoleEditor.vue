<template>
  <div :key="displayCount" class="table_cell_content table_cell_roles">
    <UserRoleTag
      v-for="role in user.roleList?.slice(0, displayCount)"
      :key="role.id"
      :role="role"
    />
    <!-- 3个及以上省略 -->
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
      multiple
      counter
      :options="options"
      option-label="name"
      option-value="id"
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
      <template #option="{ itemProps, opt, selected, toggleOption }">
        <q-item v-bind="itemProps">
          <q-item-section>
            <q-item-label>
              <UserRoleTag :role="opt" />
            </q-item-label>
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
import { UserData } from '@/api/system/user'
import UserRoleTag from './UserRoleTag.vue'
import type { RoleData } from '@/api/system/user/index'
import { assignUserRole, removeUserRole } from '@/api/system/role/index'
import { debounce, useQuasar } from 'quasar'
import { onMounted, onUnmounted, ref } from 'vue'
import { messageFrom } from '@/utils'
const $q = useQuasar()
const props = defineProps<{
  user: UserData
  options: RoleData[]
}>()
const computeDisplayThreshold = () =>
  Math.max(Math.floor((window.innerWidth * 0.18 - 28) / 100), 2)
const displayCount = ref(computeDisplayThreshold())
const handleResize = debounce(() => {
  if (displayCount.value !== computeDisplayThreshold()) {
    displayCount.value = computeDisplayThreshold()
    console.log(Math.max(Math.floor((window.innerWidth * 0.16) / 100), 2))
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
const emit = defineEmits<{
  (e: 'update', row: UserData): void
}>()

const updateUserRole = (
  opt: RoleData,
  selected: boolean,
  onSucceed: () => void,
) => {
  const source = props.user.roleList || []
  if (selected)
    removeUserRole(props.user.id, opt.id)
      .then((res: any) => {
        onSucceed()
        emit('update', {
          ...props.user,
          roleList: source.filter((role) => role.id !== opt.id),
        })
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
  else
    assignUserRole(props.user.id, opt.id)
      .then((res: any) => {
        onSucceed()
        emit('update', { ...props.user, roleList: [...source, opt] })
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
  max-width: 18vw;
  min-width: 240px;
  overflow: hidden;
}
</style>
