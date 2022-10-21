<script lang="ts" setup>
import { router } from '@/router'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-button text size="large" :style="{ padding: '4px 8px' }">
      <el-avatar :size="30" src="https://uploadstatic.mihoyo.com/contentweb/20210817/2021081714114216212.png" />
      <el-icon class="pl-1">
        <ArrowDown />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>
          登录身份：{{ userStore.info.nickname }}
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          退出账户
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
