<script setup lang="ts">
import { useLoginForm } from './hooks'

const title = import.meta.env.VITE_TITLE
const { formRef, rules, loginForm, loading, login } = useLoginForm()

const activeName = ref('basic')
</script>

<template>
  <div class="h-full grid place-items-center">
    <el-card class="w-96 py-2" style="--el-card-border-radius: 8px">
      <div class="flex flex-col justify-center items-center genshin-text pb-4">
        <img class="w-12" src="/favicon.ico">
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
              size="large"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="loginForm.username" type="text" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" type="password" show-password />
              </el-form-item>
            </el-form>
            <el-button-group class="w-full">
              <el-button type="primary" class="w-full" size="large" :loading="loading" @click="login">
                登录
              </el-button>
            </el-button-group>
          </el-tab-pane>
        </el-tabs>

        <el-divider />

        <div class="flex justify-between">
          <el-button link type="primary" disabled>
            忘记密码
          </el-button>
          <el-button link type="primary">
            <router-link to="/register">
              注册
            </router-link>
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
