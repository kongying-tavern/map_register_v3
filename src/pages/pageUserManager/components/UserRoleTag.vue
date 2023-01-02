<script lang="ts" setup>
import { useRoleOptions } from '../hooks'

const props = withDefaults(defineProps<{
  modelValue: API.SysRoleVo[] | API.SysRoleVo
  editMode?: boolean
}>(), {
  modelValue: () => [],
  editMode: false,
})
const emits = defineEmits<{
  (e: 'update:modelValue', v: API.SysRoleVo[]): void
  (e: 'active'): void
}>()

const { roleOptions, selectOptions, roleValueMap } = useRoleOptions({
  publicMode: true,
})

const internalValue = computed({
  get: () => Array.isArray(props.modelValue) ? props.modelValue[0]?.id : props.modelValue?.id,
  set: (roleId) => {
    const role = roleOptions.value.find(role => role.id === roleId)
    if (!role) {
      emits('update:modelValue', [])
      return
    }
    emits('update:modelValue', [role])
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
      filterable
      clearable
      collapse-tags
    />
    <div v-else class="flex" @click.stop="requestEdit">
      <el-tag v-if="internalValue !== undefined" disable-transitions>
        {{ Array.isArray(props.modelValue) ? props.modelValue[0]?.name : props.modelValue?.name }}
      </el-tag>
    </div>
  </div>
</template>
