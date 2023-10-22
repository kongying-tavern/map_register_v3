<script lang="ts" setup>
import { useIconCreate } from '../hooks'
import { IconDetailForm } from '.'
import { GlobalDialogController } from '@/hooks'
import { useUserInfoStore } from '@/stores'

const emits = defineEmits<{
  success: []
}>()

const userInfoStore = useUserInfoStore()
const form = ref<API.IconVo>({
  creatorId: userInfoStore.info.id,
})
const { formRef, loading, createIcon, onSuccess } = useIconCreate(form)

onSuccess(() => emits('success'))
</script>

<template>
  <div class="flex flex-col gap-2 p-5">
    <IconDetailForm ref="formRef" v-model="form" />

    <div class="flex justify-end">
      <el-button type="primary" :loading="loading" @click="createIcon">
        确认
      </el-button>
      <el-button :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </div>
  </div>
</template>
