<script lang="ts" setup>
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
import { Check, Close } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash'
import { ItemDetailForm } from '.'
import { useItemEdit } from '../hooks'

interface ItemEditorProps {
  item: API.ItemVo
  editSame?: 0 | 1
}

const props = withDefaults(defineProps<ItemEditorProps>(), {
  editSame: 0,
})

const emits = defineEmits<{
  success: []
  close: []
}>()

const { detailFormRef, formData, loading, handleSubmit, onSuccess } = useItemEdit({
  initFormData: () => cloneDeep(props.item),
})

onSuccess(() => {
  emits('close')
  emits('success')
})
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="() => emits('close')">
      {{ item.name! }} 编辑物品
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <ItemDetailForm ref="detailFormRef" v-model="formData" style="width: 540px" />
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button :icon="Check" :loading="loading" type="primary" @click="handleSubmit">
        确认
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="() => emits('close')">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
