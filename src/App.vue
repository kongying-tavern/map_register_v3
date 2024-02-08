<script setup lang="ts">
import { AppBannerProvider, AppDialogProvider, AppDrawerProvider, AppLoadingPanel, AppUserInfo, GSMessageProvider } from '@/components'
import { useBanner } from '@/hooks'

// 开发模式下显示 banner
const { visible } = useBanner()
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
  <AppDrawerProvider />
  <AppDialogProvider />
  <GSMessageProvider />
  <AppUserInfo />
</template>
