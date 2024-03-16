<script lang="ts" setup>
import { Avatar, LocationFilled, SwitchButton, UserFilled } from '@element-plus/icons-vue'
import { useUserAuthStore, useUserInfoStore } from '@/stores'
import { useTheme } from '@/hooks'

defineProps<{
  mapMode?: boolean
}>()

const userInfoStore = useUserInfoStore()
const userAuthStore = useUserAuthStore()
const { isDark } = useTheme()

const handleCommand = (command: string) => ({
  userinfo: () => userInfoStore.showUserInfo = true,
  themeschema: () => isDark.value = !isDark.value,
  logout: () => userAuthStore.logout(),
} as Record<string, () => void>)[command]?.()
</script>

<template>
  <el-dropdown class="genshin-avatar" trigger="click" style="--el-border-radius-base: 8px" @command="handleCommand">
    <el-button v-bind="$attrs" text size="large" :style="{ padding: '4px 8px' }">
      <el-avatar v-if="userInfoStore.info.logo?.trim()" class="rounded-full overflow-hidden" :size="30" :src="userInfoStore.info.logo.trim()" />
      <el-icon v-else :size="30" class="rounded-full overflow-hidden" style="background: var(--el-color-info-light-3);" color="#FFF">
        <Avatar />
      </el-icon>
      <el-icon class="pl-1">
        <ArrowDown />
      </el-icon>
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :icon="UserFilled" command="userinfo">
          个人中心
        </el-dropdown-item>

        <el-dropdown-item v-if="$route.path !== '/map'" :icon="LocationFilled">
          <router-link to="/map">
            返回地图
          </router-link>
        </el-dropdown-item>

        <el-dropdown-item
          :icon="SwitchButton"
          divided
          style="--el-text-color-regular: var(--el-color-danger); --el-dropdown-menuItem-hover-color: var(--el-color-danger)"
          command="logout"
        >
          <el-text type="danger">
            退出账户
          </el-text>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.genshin-avatar {
  transition: var(--el-transition-all);
}
</style>
