<script lang="ts" setup>
import { AppSidemenu, BreadCrumb } from '@/components'
import { LayoutAside, LayoutHeader, LayoutPage } from '@/layout'
</script>

<template>
  <div class="layout-contianer w-full h-full grid overflow-hidden">
    <LayoutAside>
      <template #header>
        <div class="h-full grid place-items-center text-sm">
          管理系统
        </div>
      </template>
      <AppSidemenu />
    </LayoutAside>

    <LayoutHeader>
      <div class="h-full flex-1 flex items-center text-sm px-4">
        <BreadCrumb />
      </div>
    </LayoutHeader>

    <LayoutPage>
      <router-view>
        <template #default="{ Component, route }">
          <transition name="slide-x" mode="out-in" appear>
            <keep-alive>
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </template>
      </router-view>
    </LayoutPage>
  </div>
</template>

<style lang="scss" scoped>
// TODO: 变量抽离
.layout-contianer {
  --c-bg-color: #fff;
  --c-aside-width: 120px;
  --c-aside-shadow: 0 2px 8px #1d23290d;
  --c-header-height: 60px;
  --c-header-shdow: 2px 0 8px #1d23290d;

  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
}
</style>
