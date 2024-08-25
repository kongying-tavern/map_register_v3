<script setup lang="ts">
import { ElNotification } from 'element-plus'
import AppDevInfo from './components/AppDevInfo.vue'
import {
  AppBannerProvider,
  AppDialogProvider,
  AppLoadingPanel,
  AppNoticeProvider,
  AppUserInfo,
  GSMessageProvider,
} from '@/components'
import { useBanner, useTheme } from '@/hooks'
import { usePreferenceStore, useShortcutStore, useSocketStore, useUserAuthStore } from '@/stores'

const socketStore = useSocketStore()
const shortcutStore = useShortcutStore()
const userSuthStore = useUserAuthStore()
const preferenceStore = usePreferenceStore()

const { isDark } = useTheme()
shortcutStore.useKeys(
  computed(() => preferenceStore.preference['app.shortcutKey.toggleDarkMode']),
  () => {
    isDark.value = !isDark.value
  },
)

// 开发模式下显示 banner
const { show } = useBanner()

// 远程注销
socketStore.event.on('UserKickedOut', () => {
  userSuthStore.logout()
  ElNotification({
    message: '您被管理员踢出',
    type: 'error',
    position: 'bottom-right',
    duration: 0,
  })
})

// 应用刷新
socketStore.event.on('AppUpdated', () => {
  const delay = 5 * 60 * 1000 // 5 分钟后刷新
  const time = new Date(Date.now() + delay).toLocaleTimeString('zh-CN', { hour12: false })
  show(`网站已更新，将于 ${time} 进行刷新`)
  window.setTimeout(() => {
    window.location.reload()
  }, delay)
})

const devInfoVisible = import.meta.env.VITE_DEV_INFO_VISIBLE === 'on'
</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col items-stretch">
    <AppLoadingPanel />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" :duration="150">
        <keep-alive :exclude="['PageLogin', 'PageRegister']">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>

  <AppDevInfo v-if="devInfoVisible" />
  <AppBannerProvider />
  <AppDialogProvider />
  <AppNoticeProvider />
  <GSMessageProvider />
  <AppUserInfo />
</template>
