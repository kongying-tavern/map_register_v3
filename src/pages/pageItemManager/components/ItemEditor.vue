<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash'
import { useItemEdit } from '../hooks'
import { ItemDetailForm } from '.'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'

interface ItemEditorProps {
  item: API.ItemVo
  editSame?: 0 | 1
}

const props = withDefaults(defineProps<ItemEditorProps>(), {
  editSame: 0,
})

const { detailFormRef, formData, loading, handleSubmit } = useItemEdit({
  initFormData: () => cloneDeep(props.item),
})
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
