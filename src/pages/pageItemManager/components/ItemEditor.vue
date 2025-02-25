<script lang="ts" setup>
import { GlobalDialogController, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'
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
}>()

const { detailFormRef, formData, loading, handleSubmit, onSuccess } = useItemEdit({
  initFormData: () => cloneDeep(props.item),
})

onSuccess(() => emits('success'))
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="GlobalDialogController.close">
      {{ item.name! }} 编辑物品
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <ItemDetailForm ref="detailFormRef" v-model="formData" style="width: 540px" />
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button :icon="Check" :loading="loading" type="primary" @click="handleSubmit">
        确认
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
