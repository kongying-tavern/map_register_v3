<script setup lang="ts">
import { useLoginForm } from './hooks'

const title = import.meta.env.VITE_TITLE
const { loginForm, loading, login, register } = useLoginForm()
</script>

<template>
  <div class="h-full grid place-items-center">
    <el-card class="w-96">
      <template #header>
        <div class="w-full text-center">
          {{ title }}
        </div>
      </template>

      <el-form label-width="60px" label-position="left">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" type="text" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" />
        </el-form-item>
      </el-form>

      <el-button-group class="w-full">
        <el-button type="primary" class="w-1/2" :loading="loading" @click="login">
          登录
        </el-button>
        <el-button class="w-1/2" :loading="loading" @click="register">
          注册
        </el-button>
      </el-button-group>
    </el-card>
  </div>
</template>
