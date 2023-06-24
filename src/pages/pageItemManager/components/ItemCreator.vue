<script lang="ts" setup>
import { useItemCreate } from '../hooks'
import { ItemDetailForm } from '.'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'

const { detailFormRef, formData, loading, handleSubmit } = useItemCreate()
</script>

<template>
  <div class="p-5">
    <ItemDetailForm ref="detailFormRef" v-model="formData" style="width: 540px" />
    <div class="w-full flex justify-end pt-2">
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
      <el-button :loading="loading" type="primary" @click="handleSubmit">
        确认
      </el-button>
    </div>
  </div>
</template>
