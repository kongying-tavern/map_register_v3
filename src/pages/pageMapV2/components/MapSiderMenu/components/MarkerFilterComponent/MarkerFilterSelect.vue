<script lang="ts" setup generic="L extends {[key: string]: string | number}[], T extends L[number], K extends keyof T, V extends T[K]">
import SingleDialog from './MarkerFilterSelectSingleDialog.vue'
import MultiDialog from './MarkerFilterSelectMultiDialog.vue'
import { useGlobalDialog } from '@/hooks'
import { GlobalDialogController } from '@/components'

const props = defineProps<{
  multiple?: boolean
  list: L
  labelKey: K
  valueKey: K
  dialogTitle?: string
  dialogListClass?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [v: V | V[]]
}>()

const modelValue = defineModel<V | V[]>('modelValue', {
  required: false,
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
        'update:modelValue': (v: V[]) => {
          emits('update:modelValue', v)
        },
        'confirm': (_v: V[]) => {
          GlobalDialogController.close()
        },
        'cancel': () => {
          GlobalDialogController.close()
        },
      })
      .open(MultiDialog)
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
        'confirm': (_v: V) => {
          GlobalDialogController.close()
        },
        'cancel': () => {
          GlobalDialogController.close()
        },
      })
      .open(SingleDialog)
  }
}
</script>

<template>
  <div
    class="inline-block"
    @click="openDialog"
  >
    <slot />
  </div>
</template>
