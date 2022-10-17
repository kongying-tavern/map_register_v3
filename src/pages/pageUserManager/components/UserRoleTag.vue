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
      size="small"
      tabindex="0"
      multiple
      collapse-tags
    />
    <div v-else class="flex gap-1" @click.stop="requestEdit">
      <el-tag v-if="props.modelValue.length" size="small" disable-transitions>
        {{ props.modelValue[0].name }}
      </el-tag>
      <el-tag v-if="props.modelValue.length > 1" size="small" disable-transitions>
        +1
      </el-tag>
    </div>
  </div>
</template>
