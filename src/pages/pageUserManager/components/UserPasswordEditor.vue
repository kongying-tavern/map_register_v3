<script setup lang="ts">
import { Check, Close } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { emptyCheck, lengthCheck } from '../utils/formRules'
import { GlobalDialogController } from '@/hooks/useGlobalDialog'
import type { ElFormType } from '@/shared'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'
import type { ItemFormRules } from '@/utils'
import { WinDialog, WinDialogFooter, WinDialogTabPanel, WinDialogTitleBar } from '@/components'

const props = defineProps<{
  user: API.SysUserVo
}>()

const formData = ref({
  userId: props.user.id,
  password: '',
})

const rules: ItemFormRules<{ password: string }> = {
  password: [lengthCheck('密码', 6), emptyCheck()],
}

const formRef = ref<ElFormType | null>(null)

const { loading, refresh: submit, onSuccess } = useFetchHook({
  onRequest: () => Api.sysUserController.updateUserPasswordByAdmin(formData.value),
})

onSuccess(() => {
  ElMessage.success({
    message: '密码修改成功',
    offset: 48,
  })
  GlobalDialogController.close()
})

const changePassword = async () => {
  try {
    await formRef.value?.validate()
    await submit()
  }
  catch (err) {
    // validate, no error
  }
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="GlobalDialogController.close">
      修改密码
    </WinDialogTitleBar>

    <WinDialogTabPanel>
      <el-form ref="formRef" label-width="100px" :model="formData" :rules="rules">
        <el-form-item label="用户名">
          {{ props.user.username }}
        </el-form-item>

        <el-form-item prop="password" label="新密码">
          <el-input v-model="formData.password" type="password" />
        </el-form-item>
      </el-form>
    </WinDialogTabPanel>

    <WinDialogFooter>
      <el-button :icon="Check" type="primary" :loading="loading" @click="changePassword">
        确认
      </el-button>
      <el-button :icon="Close" :disabled="loading" @click="GlobalDialogController.close">
        取消
      </el-button>
    </WinDialogFooter>
  </WinDialog>
</template>
