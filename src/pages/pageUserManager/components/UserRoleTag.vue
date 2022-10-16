<script lang="ts" setup>
import { useRoleOptions } from '../hooks'

const props = withDefaults(defineProps<{
  modelValue: API.SysRoleVo[]
}>(), {
  modelValue: () => [],
})
const emits = defineEmits<{
  (e: 'update:modelValue', v: API.SysRoleVo[]): void
}>()

const { roleOptions, selectOptions } = useRoleOptions({
  publicMode: true,
})

const internalValue = computed({
  get: () => props.modelValue.map(role => role.id),
  set: (roleIds) => {
    const roles = roleIds.reduce((seed, id) => {
      const findRole = roleOptions.value.find(role => role.id === id)
      findRole && seed.push(findRole)
      return seed
    }, [] as API.SysRoleVo[])
    emits('update:modelValue', roles)
  },
})
</script>

<template>
  <el-select-v2
    v-model="internalValue"
    class="w-full"
    :options="selectOptions"
    multiple
    collapse-tags
    collapse-tags-tooltip
  />
</template>
