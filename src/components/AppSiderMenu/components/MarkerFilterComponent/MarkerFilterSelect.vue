<script lang="ts" setup generic="T extends {[key: string]: string | number} | unknown, K extends string, V extends unknown">
import { useGlobalDialog } from '@/hooks'
import MultiDialog from './MarkerFilterSelectMultiDialog.vue'
import SingleDialog from './MarkerFilterSelectSingleDialog.vue'

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

const openDialog = () => {
  if (props.multiple) {
    dialogValue.value = modelValue.value
    const controller = DialogService
      .props({
        modelValue: dialogValue,
        title: props.dialogTitle,
        listClass: props.dialogListClass,
        list: props.list,
        labelKey: props.labelKey,
        valueKey: props.valueKey,
      })
      .listeners({
        'update:modelValue': (v) => {
          dialogValue.value = v as V[]
        },
        'confirm': (v) => {
          modelValue.value = v as V[]
          emits('change', v as V[])
          controller.close()
        },
        'cancel': () => {
          emits('cancel')
          controller.close()
        },
      })
      .open(MultiDialog)
  }
  else {
    dialogValue.value = modelValue.value
    const controller = DialogService
      .props({
        modelValue: dialogValue,
        title: props.dialogTitle,
        listClass: props.dialogListClass,
        list: props.list,
        labelKey: props.labelKey,
        valueKey: props.valueKey,
      })
      .listeners({
        'update:modelValue': (v) => {
          dialogValue.value = v as V
        },
        'confirm': (v) => {
          modelValue.value = v as V
          emits('change', v as V)
          controller.close()
        },
        'cancel': () => {
          emits('cancel')
          controller.close()
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
