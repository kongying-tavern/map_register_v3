<script lang="ts" setup>
import { AppUserInfo } from '.'
import { router } from '@/router'
import { useUserStore } from '@/stores'
import { useGlobalDialog, useTheme } from '@/hooks'

defineProps<{
  mapMode?: boolean
}>()

const userStore = useUserStore()
const { isDark } = useTheme()

const { DialogService } = useGlobalDialog()
const openUserInfoDialog = () => {
  DialogService
    .config({
      showClose: false,
      width: 1200,
      alignCenter: true,
      class: 'bg-transparent',
    })
    .open(AppUserInfo)
}

const handleCommand = (command: string) => ({
  logout: () => userStore.logout(),
  toManager: () => router.push('/items'),
  toMap: () => router.push('/map'),
  toUserCenter: () => openUserInfoDialog(),
  toggleThemeSchema: () => isDark.value = !isDark.value,
} as Record<string, () => void>)[command]?.()
</script>

<template>
  <el-dropdown trigger="click" style="--el-border-radius-base: 8px" @command="handleCommand">
    <el-button v-bind="$attrs" text size="large" :style="{ padding: '4px 8px' }">
      <el-avatar :size="30" src="https://uploadstatic.mihoyo.com/contentweb/20210817/2021081714114216212.png" />
      <el-icon class="pl-1">
        <ArrowDown />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="toUserCenter">
          {{ userStore.info.nickname }}
        </el-dropdown-item>
        <el-dropdown-item v-if="mapMode" command="toManager">
          管理界面
        </el-dropdown-item>
        <el-dropdown-item v-else command="toMap">
          地图界面
        </el-dropdown-item>
        <el-dropdown-item command="toggleThemeSchema">
          {{ isDark ? '明亮' : '黑暗' }}模式
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          退出账户
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
