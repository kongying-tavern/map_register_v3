<script lang="ts" setup>
import { AppSettings, AppUserInfo } from '.'
import { useUserStore } from '@/stores'
import { useGlobalDialog, useTheme } from '@/hooks'
import { useMap } from '@/pages/pageMap/hooks'
import { FALLBACK_AVATAR_URL } from '@/shared/constant'

defineProps<{
  mapMode?: boolean
}>()

const userStore = useUserStore()
const { isDark } = useTheme()
const { map } = useMap()
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

const openSettingDialog = () => DialogService
  .config({
    title: '设置界面',
    alignCenter: true,
    width: 'fit-content',
  })
  .open(AppSettings)

const handleCommand = (command: string) => ({
  userinfo: () => openUserInfoDialog(),
  themeschema: () => isDark.value = !isDark.value,
  setting: () => openSettingDialog(),
  logout: () => userStore.logout(),
} as Record<string, () => void>)[command]?.()

const handleDragging = computed(() => map.value?.handleState.draggingMarker)
</script>

<template>
  <el-dropdown class="genshin-avatar" :class="{ handleDragging }" trigger="click" style="--el-border-radius-base: 8px" @command="handleCommand">
    <el-button v-bind="$attrs" text size="large" :style="{ padding: '4px 8px' }">
      <el-avatar :size="30" :src="userStore.info.logoUrl || FALLBACK_AVATAR_URL" />
      <el-icon class="pl-1">
        <ArrowDown />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="userinfo">
          {{ userStore.info.nickname }}
        </el-dropdown-item>
        <el-dropdown-item v-if="userStore.isAdmin">
          <router-link to="/items">
            管理界面
          </router-link>
        </el-dropdown-item>
        <el-dropdown-item>
          <router-link to="/map">
            地图V1
          </router-link>
        </el-dropdown-item>
        <el-dropdown-item>
          <router-link to="/map-v2">
            地图V2
          </router-link>
        </el-dropdown-item>
        <el-dropdown-item divided command="setting">
          系统设置
        </el-dropdown-item>
        <el-dropdown-item command="themeschema">
          {{ isDark ? '明亮' : '黑暗' }}模式
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
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
  &.handleDragging {
    translate: calc(200%) 0;
    pointer-events: none;
  }
}
</style>
