<script lang="ts" setup>
import { useRoleOptions } from '../hooks'

const props = withDefaults(defineProps<{
  modelValue?: number
  editMode?: boolean
}>(), {
  editMode: false,
})
const emits = defineEmits<{
  (e: 'update:modelValue', v?: number): void
  (e: 'active'): void
}>()

const { roleMap, selectOptions } = useRoleOptions({
  publicMode: true,
})

const role = computed(() => props.modelValue === undefined ? undefined : roleMap.value[props.modelValue])

const internalValue = computed({
  get: () => props.modelValue,
  set: (roleId) => {
    emits('update:modelValue', roleId)
  },
})
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
    <div v-else class="flex" @click.stop="$emit('active')">
      <el-tag disable-transitions :type="role ? 'default' : 'danger'">
        {{ role?.name ?? '角色信息丢失' }}
      </el-tag>
    </div>
  </div>
</template>
