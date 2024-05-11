<script setup lang="ts">
import { ElNotification } from 'element-plus'
import {
  AppBannerProvider,
  AppDialogProvider,
  AppLoadingPanel,
  AppNoticeProvider,
  AppUserInfo,
  GSMessageProvider,
} from '@/components'
import { useBanner } from '@/hooks'
import { useSocketStore, useUserAuthStore } from '@/stores'

const socketStore = useSocketStore()
const userSuthStore = useUserAuthStore()

// 开发模式下显示 banner
const { visible } = useBanner()

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
</script>

<template>
  <div
    class="w-full h-full overflow-hidden flex flex-col items-stretch transition-all duration-200"
    :class="{
      'pt-8': visible,
    }"
  >
    <AppLoadingPanel />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" :duration="150">
        <keep-alive :exclude="['PageLogin', 'PageRegister']">
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>

  <AppBannerProvider />
  <AppDialogProvider />
  <AppNoticeProvider />
  <GSMessageProvider />
  <AppUserInfo />
</template>
