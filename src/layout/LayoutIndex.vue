<template>
  <div class="layout-contianer">
    <div class="layout-aside">侧边栏</div>

    <div class="layout-header">
      <div class="text">顶部</div>
    </div>

    <div class="layout-main">
      <BreadCrumb />
      <router-view>
        <template #default="{ Component, route }">
          <transition name="slide-x" mode="out-in" appear>
            <keep-alive>
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </template>
      </router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BreadCrumb } from '@/components'
</script>

<style lang="scss" scoped>
.text {
  @media (prefers-color-scheme: no-preference) {
    &::after {
      content: 'no-preference';
    }
  }
  @media (prefers-color-scheme: light) {
    &::after {
      content: 'light';
    }
  }
  @media (prefers-color-scheme: dark) {
    &::after {
      content: 'dark';
    }
  }
}

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

  .layout-aside {
    width: var(--c-aside-width);
    grid-row-start: span 2;
    box-shadow: var(--c-aside-shadow);
    background-color: var(--c-bg-color);
    transition: width 0.2s ease, background-color 0.2s;
  }

  .layout-header {
    display: flex;
    height: var(--c-header-height);
    background-color: var(--c-bg-color);
    box-shadow: var(--c-header-shdow);
    transition: background-color 0.2s;
  }

  .layout-main {
    transition: width 0.2s ease, background-color 0.2s;
  }
}
</style>
