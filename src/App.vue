<script setup lang="ts">
import { AppBannerProvider, AppDialogProvider, AppDrawerProvider, AppLoadingPanel, AppUserInfo, GSMessageProvider } from '@/components'
import { visible as bannerVisible } from '@/hooks/useBanner/bannerContext'
import { useBanner } from '@/hooks'
import { useUserStore } from '@/stores'

const route = useRoute()

// 根据路由名称切换网页标题
const routeName = computed(() => `${route.meta.title ? route.meta.title : import.meta.env.VITE_TITLE}`)
useTitle(routeName, { titleTemplate: '%s' })

// 开发模式下显示 banner
const { show } = useBanner()
import.meta.env.DEV && show(import.meta.env.VITE_ENV_BANNER)

const userStore = useUserStore()
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-stretch transition-all duration-200"
    :class="{
      'pt-8': bannerVisible,
      'pt-0': !bannerVisible,
    }"
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
