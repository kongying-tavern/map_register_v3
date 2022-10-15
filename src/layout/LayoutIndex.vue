<script lang="ts" setup>
import { AppSidemenu, BreadCrumb } from '@/components'
import { LayoutAside, LayoutHeader, LayoutPage } from '@/layout'
</script>

<template>
  <div class="layout-contianer">
    <LayoutAside>
      <template #header>
        logo
      </template>
      <AppSidemenu />
    </LayoutAside>

    <LayoutHeader>顶部</LayoutHeader>

    <LayoutPage>
      <template #header>
        <BreadCrumb />
      </template>
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

  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
}
</style>
