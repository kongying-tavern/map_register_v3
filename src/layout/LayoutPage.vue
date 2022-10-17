<script lang="ts" setup>
const ctx = getCurrentInstance()
</script>

<template>
  <div class="layout-page p-4" v-bind="$attrs">
    <div v-if="ctx?.slots.header" class="layout-page__header">
      <slot name="header" />
    </div>

    <div class="layout-page__main">
      <router-view>
        <template #default="{ Component, route }">
          <transition name="scale" mode="out-in" appear>
            <keep-alive>
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </template>
      </router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-page {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s ease, background-color 0.2s;

  .layout-page__main {
    flex: 1;
    overflow: hidden;
  }
}
</style>
