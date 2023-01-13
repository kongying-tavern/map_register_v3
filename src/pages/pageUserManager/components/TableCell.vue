<script lang="ts" setup>
const props = defineProps<{
  modelValue?: string | number
  editMode?: boolean
  readonly?: boolean
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v?: string | number): void
  (e: 'active'): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v),
})

const requestEdit = (ev: Event) => {
  if (props.readonly)
    return
  ev.stopPropagation()
  emits('active')
}
</script>

<template>
  <div class="flex items-center h-8">
    <el-input v-if="!props.readonly && props.editMode" v-model="internalValue" @click.stop="" />
    <div v-else class="w-full" @click="requestEdit">
      {{ props.modelValue || '-' }}
    </div>
  </div>
</template>
