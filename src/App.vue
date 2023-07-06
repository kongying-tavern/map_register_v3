<script setup lang="ts">
import { AppBannerProvider, AppDialogProvider, AppDrawerProvider, AppLoadingPanel, AppUserInfo, GSMessageProvider } from '@/components'
import { visible as bannerVisible } from '@/hooks/useBanner/bannerContext'
import { useBanner } from '@/hooks'
import { useUserStore } from '@/stores'

// 开发模式下显示 banner
const { show } = useBanner()
import.meta.env.DEV && show(import.meta.env.VITE_ENV_BANNER)

const userStore = useUserStore()
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-stretch transition-all duration-200"
    :class="[
      bannerVisible ? 'pt-8' : '',
    ]"
  >
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in" appear>
        <keep-alive :exclude="['PageLogin', 'PageRegister']">
          <component :is="userStore.showLoadingPanel ? AppLoadingPanel : Component" />
        </keep-alive>
      </Transition>
    </router-view>
  </div>

  <AppBannerProvider />
  <AppDrawerProvider />
  <AppDialogProvider />
  <GSMessageProvider />
  <AppUserInfo />
</template>
