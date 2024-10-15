<script setup lang="ts">
import { ElDialog } from 'element-plus'
import { useLoginForm } from './hooks'
import { useCountDown } from '@/hooks'
import { WinDialog, WinDialogTitleBar } from '@/components/WinUI'

const visible = defineModel<boolean>('visible', {
  required: true,
})

const title = import.meta.env.VITE_TITLE
const { formRef, rules, loginForm, loading, login, onSuccess } = useLoginForm()

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
  <ElDialog
    v-model="visible"
    destroy-on-close
    append-to-body
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="custom-dialog hidden-header"
    :style="{
      '--el-dialog-border-radius': '8px',
      '--el-dialog-padding-primary': '0',
      '--el-dialog-width': 'auto',
    }"
  >
    <WinDialog>
      <WinDialogTitleBar @close="visible = false">
        登录
      </WinDialogTitleBar>

      <div class="w-[340px] flex flex-col p-4 bg-[var(--el-bg-color)]" style="--el-border-radius-base: 8px">
        <div class="flex flex-col justify-center items-center font-['HYWenHei-85W'] pb-4">
          <img class="w-12 h-12" src="/favicon.ico">
          {{ title }}
        </div>

        <el-form
          ref="formRef"
          label-width="70px"
          label-position="left"
          :model="loginForm"
          :rules="rules"
          size="large"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名或Q号" type="text" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" placeholder="请输入密码" type="password" show-password />
          </el-form-item>
        </el-form>
        <div class="flex">
          <el-button type="primary" class="w-full" size="large" :disabled="count > 0" :loading="loading" @click="trigger">
            登录 {{ count > 0 ? `(${count})` : '' }}
          </el-button>
        </div>

        <el-divider style="margin: 24px 0 16px" />

        <div class="flex justify-between">
          <el-button link type="primary" disabled>
            忘记密码
          </el-button>
          <el-button link type="primary">
            没有账号？去注册 →
          </el-button>
        </div>
      </div>
    </WinDialog>
  </ElDialog>
</template>
