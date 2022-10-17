<script lang="ts" setup>
import { useRoleOptions } from '../hooks'

const props = withDefaults(defineProps<{
  modelValue: API.SysRoleVo[]
  editMode?: boolean
}>(), {
  modelValue: () => [],
  editMode: false,
})
const emits = defineEmits<{
  (e: 'update:modelValue', v: API.SysRoleVo[]): void
  (e: 'active'): void
}>()

const { selectOptions, roleValueMap } = useRoleOptions({
  publicMode: true,
})

const internalValue = computed({
  get: () => props.modelValue.map(role => role.id),
  set: (roleIds) => {
    const roles = roleIds.reduce((seed, id) => {
      if (id) {
        const findRole = roleValueMap.value[id]
        findRole && seed.push(findRole)
      }
      return seed
    }, [] as API.SysRoleVo[])
    emits('update:modelValue', roles)
  },
})

const requestEdit = () => {
  emits('active')
}
</script>

<template>
  <div>
    <el-select-v2
      v-if="props.editMode"
      v-model="internalValue"
      :options="selectOptions"
      class="w-full"
      tabindex="0"
      multiple
      collapse-tags
    />
    <div v-else class="flex gap-1" @click.stop="requestEdit">
      <el-tag v-if="props.modelValue.length" disable-transitions>
        {{ props.modelValue[0].name }}
      </el-tag>
      <el-tag v-if="props.modelValue.length > 1" disable-transitions>
        +{{ props.modelValue.length - 1 }}
      </el-tag>
    </div>
  </div>
</template>
