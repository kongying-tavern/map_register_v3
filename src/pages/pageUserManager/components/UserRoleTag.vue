<script lang="ts" setup>
import type { QChipProps } from 'quasar'

defineProps<{ role: API.SysRoleVo }>()
const mapRoleTagProps = (role = '') => {
  const list: { [role: string]: QChipProps } = {
    ADMIN: { color: 'red', textColor: 'white' },
    MAP_MANAGER: { color: 'blue', textColor: 'white' },
    MAP_NEIGUI: { textColor: 'orange-10', outline: true },
    MAP_PUNCTUATE: { textColor: 'teal', outline: true },
    MAP_USER: { textColor: 'brown', outline: true },
    VISITOR: { textColor: 'blue-grey', outline: true },
  }
  return list[role]
}
</script>

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
