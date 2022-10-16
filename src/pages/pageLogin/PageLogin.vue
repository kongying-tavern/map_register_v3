<script setup lang="ts">
import { useLoginForm } from './hooks'

const title = import.meta.env.VITE_TITLE
const { loginForm, loading, login } = useLoginForm()
</script>

<template>
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
      <el-button label="登录" type="primary" class="w-full" :loading="loading" @click="login">
        登录
      </el-button>
    </el-form>
  </el-card>
</template>
