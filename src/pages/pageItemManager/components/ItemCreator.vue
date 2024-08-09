<script lang="ts" setup>
import { Check, Close } from '@element-plus/icons-vue'
import { useItemCreate } from '../hooks'
import { ItemDetailForm } from '.'
import { GlobalDialogController, WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'

const emits = defineEmits<{
  success: []
}>()

const { detailFormRef, formData, loading, handleSubmit, onSuccess } = useItemCreate()

onSuccess(() => emits('success'))
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="GlobalDialogController.close">
      新建物品
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
