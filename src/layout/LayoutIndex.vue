<template>
  <div class="layout-contianer">
    <LayoutAside>
      <template #header>logo</template>
      <AppSidemenu></AppSidemenu>
    </LayoutAside>

    <div class="layout-header">
      <div>顶部</div>
    </div>

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

<script lang="ts" setup>
import { AppSidemenu, BreadCrumb } from '@/components'
import { LayoutAside, LayoutPage } from '@/layout'
</script>

<style lang="scss" scoped>
// TODO: 变量抽离
.layout-contianer {
  --c-bg-color: #fff;
  --c-aside-width: 200px;
  --c-aside-shadow: 0 2px 8px #1d23290d;
  --c-header-height: 60px;
  --c-header-shdow: 2px 0 8px #1d23290d;

  @media screen and (max-width: 900px) {
    --c-aside-width: 60px;
  }

  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;

  .layout-header {
    display: flex;
    height: var(--c-header-height);
    background-color: var(--c-bg-color);
    box-shadow: var(--c-header-shdow);
    transition: background-color 0.2s;
  }
}
</style>
