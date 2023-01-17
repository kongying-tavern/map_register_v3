<script setup lang="ts">
import { AppDialogProvider } from '@/components'

const route = useRoute()

const envBanner = (import.meta.env.VITE_ENV_BANNER || '').trim()
const isMapPage = computed(() => route.path === '/map')
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-stretch"
  >
    <div
      v-if="envBanner"
      class="genshin-text text-md p-1 px-2 text-center transition-all duration-150"
      :class="{
        'text-orange-400': !isMapPage,
      }"
      :style="{
        background: isMapPage ? '#E2DED5' : 'var(--el-bg-color)',
        color: isMapPage ? '#4A4F50' : undefined,
      }"
    >
      {{ envBanner }}
    </div>

    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in" appear>
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </Transition>
    </router-view>
  </div>

  <AppDialogProvider />
</template>
