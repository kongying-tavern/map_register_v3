<script lang="ts" setup>
import { router } from '@/router'
import { useUserStore } from '@/stores'

defineProps<{
  mapMode?: boolean
}>()

const userStore = useUserStore()

const roleName = userStore.info.roleList ? userStore.info.roleList[0].name : '暂无任何权限'

const handleCommand = (command: string) => ({
  logout: () => userStore.logout(),
  toManager: () => router.push('/items'),
  toMap: () => router.push('/map'),
  toUserCenter: () => {},
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
          登录身份：{{ roleName }}
        </el-dropdown-item>
        <el-dropdown-item v-if="mapMode" divided command="toManager">
          管理中心
        </el-dropdown-item>
        <el-dropdown-item v-else divided command="toMap">
          大地图
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          退出账户
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
