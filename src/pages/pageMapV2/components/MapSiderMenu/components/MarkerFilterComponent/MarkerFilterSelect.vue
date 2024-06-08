<script lang="ts" setup generic="L extends {[key: string]: string | number}[], T extends L[number], K extends keyof T, V extends T[K]">
import SingleDialog from './MarkerFilterSelectSingleDialog.vue'
import { useGlobalDialog } from '@/hooks'

const props = defineProps<{
  multiple?: boolean
  list: L
  labelKey: K
  valueKey: K
  dialogTitle?: string
  dialogListClass?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [v: V]
}>()

const modelValue = defineModel<V>('modelValue', {
  required: true,
  default: null,
})

const { DialogService } = useGlobalDialog()

const getDialogConfig = () => ({
  width: 'fit-content',
  alignCenter: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  class: 'custom-dialog hidden-header bg-transparent',
})

const openDialog = () => {
  if (props.multiple) {
    // TODO
  }
  else {
    DialogService
      .config(getDialogConfig())
      .props({
        modelValue,
        title: props.dialogTitle,
        listClass: props.dialogListClass,
        list: props.list,
        labelKey: props.labelKey,
        valueKey: props.valueKey,
      })
      .listeners({
        'update:modelValue': (v: V) => {
          emits('update:modelValue', v)
        },
      })
      .open(SingleDialog)
  }
}
</script>

<template>
  <div class="inline-block" @click="openDialog">
    <slot />
  </div>
</template>
