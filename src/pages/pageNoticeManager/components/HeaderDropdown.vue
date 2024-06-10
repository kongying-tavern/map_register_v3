<script setup lang="ts">
import { ElDropdown } from 'element-plus'
import DropdownButton from './DropdownButton.vue'

const props = defineProps<{
  dropdownKey: string
  icon?: string | Component
}>()

const modelValue = defineModel<string>('modelValue', {
  required: false,
  default: '',
})

const dropdownRef = ref<InstanceType<typeof ElDropdown>>()

const internalVisible = ref(false)

const handleVisibleChange = (visible: boolean) => {
  internalVisible.value = visible
  if (!visible) {
    modelValue.value = ''
    return
  }
  modelValue.value = props.dropdownKey
}

watch(modelValue, (key) => {
  if (!internalVisible.value || !modelValue.value)
    return
  if (props.dropdownKey !== key)
    dropdownRef.value?.handleClose()
})

defineExpose({
  close: () => dropdownRef.value?.handleClose(),
})
</script>

<template>
  <ElDropdown
    ref="dropdownRef"
    trigger="click"
    @visible-change="v => handleVisibleChange(v)"
  >
    <template #default>
      <DropdownButton :is-open="dropdownKey === modelValue" :icon="icon">
        <slot name="default" />
      </DropdownButton>
    </template>

    <template #dropdown>
      <slot name="dropdown" />
    </template>
  </ElDropdown>
</template>
