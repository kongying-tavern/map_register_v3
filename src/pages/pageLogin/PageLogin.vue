<script setup lang="ts">
import { useLoginForm } from './hooks'
import { useCountDown } from '@/hooks'

const title = import.meta.env.VITE_TITLE
const { formRef, rules, loginForm, loading, login } = useLoginForm()

const activeName = ref('basic')

const isOfflineMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'offline'

const router = useRouter()

const { count, set: setCount } = useCountDown()

const trigger = async () => {
  if (count.value > 0)
    return
  setCount(3)
  await login()
}
</script>

<template>
  <div
    class="login-page h-full grid place-items-center"
    :class="{
      'is-loading': loading,
    }"
  >
    <el-card class="w-96 py-2" style="--el-card-border-radius: 8px">
      <div class="flex flex-col justify-center items-center genshin-text pb-4">
        <img class="w-12 h-12" src="/favicon.ico">
        {{ title }}
      </div>

      <div class="flex flex-col" style="--el-border-radius-base: 8px">
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane label="密码登录" name="basic" class="pt-4">
            <el-form
              ref="formRef"
              label-width="70px"
              label-position="left"
              :model="loginForm"
              :rules="rules"
              class="pb-4"
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
              <el-button v-if="isOfflineMode" class="w-full" size="large" @click="() => router.push('/')">
                离线 (仅开发可用)
              </el-button>
              <el-button type="primary" class="w-full" size="large" :disabled="count > 0" :loading="loading" @click="trigger">
                登录 {{ count > 0 ? `(${count})` : '' }}
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-divider />

        <div class="flex justify-between">
          <el-button link type="primary" disabled>
            忘记密码
          </el-button>
          <el-button link type="primary">
            <router-link to="/register">
              没有账号？去注册 →
            </router-link>
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
@property --login-page-offset {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@keyframes login-page-anime {
  from {
    --login-page-offset: 100%;
  }
  to {
    --login-page-offset: 0%;
  }
}

.login-page {
  --color-a: var(--el-color-primary-light-5);
  --color-b: transparent;
  --gap: 5%;
  --state: paused;

  background: repeating-linear-gradient(
    -45deg,
    var(--color-a) var(--login-page-offset),
    var(--color-a) calc(var(--login-page-offset) + var(--gap)),
    var(--color-b) calc(var(--login-page-offset) + var(--gap)),
    var(--color-b) calc(var(--login-page-offset) + 2 * var(--gap))
  );
  animation: login-page-anime 30s linear 0s infinite;
  animation-play-state: var(--state);

  &.is-loading {
    --state: running;
  }
}
</style>
