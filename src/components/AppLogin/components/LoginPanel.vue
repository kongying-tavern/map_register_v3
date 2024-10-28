<script setup lang="ts">
import { ElButton, ElDivider, ElForm, ElFormItem, ElInput } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useLoginForm } from '../hooks'
import { useCountDown } from '@/hooks'
import { WinDialog, WinDialogTitleBar } from '@/components/WinUI'

const visible = defineModel<boolean>('visible', {
  required: true,
})

const panelKey = defineModel<string>('panelKey', {
  required: true,
})

const title = import.meta.env.VITE_TITLE

const {
  formRef,
  isValid,
  rules,
  loginForm,
  loading,
  login,
  onSuccess,
  handleValidate,
} = useLoginForm()

onSuccess(() => {
  visible.value = false
})

const { count, set: setCount } = useCountDown()

const trigger = async () => {
  if (count.value > 0)
    return
  setCount(3)
  await login()
}
</script>

<template>
  <WinDialog>
    <WinDialogTitleBar :loading="loading" @close="visible = false">
      登录
    </WinDialogTitleBar>

    <div class="w-[340px] flex flex-col p-4 bg-[var(--el-bg-color)]" style="--el-border-radius-base: 8px">
      <div class="flex flex-col justify-center items-center font-['HYWenHei-85W'] pb-4">
        <img class="w-12 h-12" src="/favicon.ico">
        {{ title }}
      </div>

      <ElForm
        ref="formRef"
        label-width="70px"
        label-position="left"
        :model="loginForm"
        :rules="rules"
        size="large"
        class="user-form"
        @validate="handleValidate"
      >
        <ElFormItem label="用户名" prop="username">
          <ElInput
            v-model="loginForm.username"
            placeholder="请输入用户名或Q号"
            type="text"
          />
        </ElFormItem>

        <ElFormItem label="密码" prop="password">
          <ElInput
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </ElFormItem>

        <div class="flex">
          <ElButton
            type="primary"
            class="w-full"
            size="large"
            :icon="User"
            :disabled="!isValid || count > 0" :loading="loading"
            @click="trigger"
          >
            登录 {{ count > 0 ? `(${count})` : '' }}
          </ElButton>
        </div>
      </ElForm>

      <ElDivider style="margin: 24px 0 16px" />

      <div class="flex justify-between">
        <ElButton link type="primary" disabled title="暂时没做这个功能">
          忘记密码
        </ElButton>
        <ElButton link type="success" :disabled="loading" @click="panelKey = 'register'">
          没有账号？去注册 →
        </ElButton>
      </div>
    </div>
  </WinDialog>
</template>

<style scoped>
.user-form {
  :deep(.el-form-item) {
    label {
      font-size: 12px;
    }
  }
}
</style>
