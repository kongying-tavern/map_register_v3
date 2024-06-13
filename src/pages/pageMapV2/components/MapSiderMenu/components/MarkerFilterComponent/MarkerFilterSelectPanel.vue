<script lang="ts" setup generic="L extends {[key: string]: string | number}[], T extends L[number], K extends keyof T, V extends T[K]">
import SingleDialog from './MarkerFilterSelectSingleDialog.vue'
import MultiDialog from './MarkerFilterSelectMultiDialog.vue'

const props = defineProps<{
  multiple?: boolean
  list: L
  labelKey: K
  valueKey: K
  dialogTitle?: string
  dialogListClass?: string
}>()

const modelValue = defineModel<V | V[]>('modelValue', {
  required: false,
  default: null,
})

const dialogTemplate = computed(() => props.multiple ? MultiDialog : SingleDialog)

const dialogVisible = ref<boolean>(false)

const openDialog = () => {
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const confirm = (_v?: V | V[]) => {
  closeDialog()
}

const cancel = () => {
  closeDialog()
}
</script>

<template>
  <div class="inline-block" @click="openDialog()">
    <slot />
  </div>

  <el-dialog
    v-model="dialogVisible"
    width="fit-content"
    append-to-body
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="custom-dialog hidden-header bg-transparent"
  >
    <component
      :is="dialogTemplate"
      v-model="modelValue"
      v-bind="{
        title: dialogTitle,
        listClass: dialogListClass,
        list,
        labelKey,
        valueKey,
      }"
      @confirm="confirm()"
      @cancel="cancel()"
    >
      <template v-if="$slots.list" #list="slotProps">
        <slot
          name="list"
          v-bind="slotProps"
        />
      </template>
    </component>
  </el-dialog>
</template>
