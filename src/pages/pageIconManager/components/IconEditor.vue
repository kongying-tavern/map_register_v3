<script lang="ts" setup>
import { useIconEdit } from '../hooks'
import { IconDetailForm } from '.'
import { GlobalDialogController } from '@/hooks'

const props = defineProps<{
  icon: API.IconVo
}>()

const form = ref(props.icon)
const { formRef, loading, editIcon } = useIconEdit(form)
</script>

<template>
  <div class="flex flex-col gap-2 p-5">
    <IconDetailForm ref="formRef" v-model="form" />

    <div class="flex justify-end">
      <el-button type="primary" :loading="loading" @click="editIcon">
        确认
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
