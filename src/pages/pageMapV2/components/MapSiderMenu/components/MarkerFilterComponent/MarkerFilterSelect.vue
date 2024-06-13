<script lang="ts" setup generic="T extends {[key: string]: string | number}, K extends string, V extends unknown">
import type { Ref } from 'vue'
import SingleDialog from './MarkerFilterSelectSingleDialog.vue'
import MultiDialog from './MarkerFilterSelectMultiDialog.vue'
import { useGlobalDialog } from '@/hooks'
import { GlobalDialogController } from '@/components'

const props = defineProps<{
  multiple?: boolean
  list: T[]
  labelKey: K
  valueKey: K
  dialogTitle?: string
  dialogListClass?: string
}>()

const emits = defineEmits<{
  change: [v: V | V[]]
  cancel: []
}>()

const modelValue = defineModel<V | V[]>('modelValue', {
  required: false,
  default: null,
})

const { DialogService } = useGlobalDialog()

const dialogValue: Ref<V | V[] | undefined> = ref(undefined)

const getDialogConfig = () => ({
  width: 'fit-content',
  alignCenter: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  class: 'custom-dialog hidden-header bg-transparent',
})

const openDialog = () => {
  if (props.multiple) {
    dialogValue.value = modelValue.value
    DialogService
      .config(getDialogConfig())
      .props({
        modelValue: dialogValue,
        title: props.dialogTitle,
        listClass: props.dialogListClass,
        list: props.list,
        labelKey: props.labelKey,
        valueKey: props.valueKey,
      })
      .listeners({
        'update:modelValue': (v: V[]) => {
          dialogValue.value = v
        },
        'confirm': (v: V[]) => {
          modelValue.value = v
          emits('change', v)
          GlobalDialogController.close()
        },
        'cancel': () => {
          emits('cancel')
          GlobalDialogController.close()
        },
      })
      .open(MultiDialog)
  }
  else {
    dialogValue.value = modelValue.value
    DialogService
      .config(getDialogConfig())
      .props({
        modelValue: dialogValue,
        title: props.dialogTitle,
        listClass: props.dialogListClass,
        list: props.list,
        labelKey: props.labelKey,
        valueKey: props.valueKey,
      })
      .listeners({
        'update:modelValue': (v: V) => {
          dialogValue.value = v
        },
        'confirm': (v: V) => {
          modelValue.value = v
          emits('change', v)
          GlobalDialogController.close()
        },
        'cancel': () => {
          emits('cancel')
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
