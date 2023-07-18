<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { useItemEdit } from '../hooks'
import { ItemDetailForm } from '.'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'

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
  <div class="p-5">
    <ItemDetailForm ref="detailFormRef" v-model="formData" style="width: 540px" />
    <div class="w-full flex justify-end pt-2">
      <el-button :loading="loading" type="primary" @click="handleSubmit">
        确认
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
