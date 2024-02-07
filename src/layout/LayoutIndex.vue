<script lang="ts" setup>
import { AppBreadCrumb, AppLogo, AppSidemenu, AppUserAvatar } from '@/components'
import { useTheme } from '@/hooks'
import { LayoutAside, LayoutHeader, LayoutPage } from '@/layout'

// TODO: 管理这边还没适配黑暗模式，先这么用着
const { isDark } = useTheme()
onBeforeMount(() => {
  isDark.value = false
})
</script>

<template>
  <div class="layout-contianer w-full h-full grid overflow-hidden">
    <LayoutAside>
      <template #header>
        <AppLogo />
      </template>
      <AppSidemenu />
    </LayoutAside>

    <LayoutHeader>
      <div class="h-full flex-1 flex items-center justify-between text-sm px-4 gap-4">
        <AppBreadCrumb class="flex-1" />
        <AppUserAvatar />
      </div>
    </LayoutHeader>

    <LayoutPage />
  </div>
</template>

<style lang="scss" scoped>
// TODO: 变量抽离
.layout-contianer {
  --c-aside-width: 160px;
  --c-aside-shadow: 0 2px 8px #1d23290d;
  --c-header-height: 60px;
  --c-header-shdow: 2px 0 8px #1d23290d;

  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
}
</style>
