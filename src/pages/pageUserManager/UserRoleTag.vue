<template>
  <q-chip
    :key="role.id"
    class="role_item"
    :label="role.name"
    v-bind="mapRoleTagProps(role.code)"
    size="md"
    square
  />
</template>

<script lang="ts" setup>
import { RoleData } from '@/api/system/user'
import { QChipProps } from 'quasar'

const mapRoleTagProps = (role: string) => {
  const list: { [role: string]: QChipProps } = {
    ADMIN: { color: 'red', textColor: 'white' },
    MAP_MANAGER: { color: 'blue', textColor: 'white' },
    MAP_NEIGUI: { textColor: 'orange', outline: true },
    MAP_USER: { textColor: 'blue-grey', outline: true },
  }
  return list[role]
}
defineProps<{ role: RoleData }>()
</script>
