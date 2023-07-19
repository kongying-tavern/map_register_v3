<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'

const route = useRoute()
const userStore = useUserStore()
</script>

<template>
  <el-menu :default-active="route.path" router class="app-sidemenu h-full">
    <el-menu-item
      v-for="item in userStore.menuRoutes"
      :key="item.path"
      :index="item.path"
    >
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      {{ item.meta?.title }}
    </el-menu-item>
  </el-menu>
</template>

<style lang="scss" scoped>
.app-sidemenu {
  --el-menu-item-height: 44px;
  --el-menu-base-level-padding: 12px;

  border-right: none;

  :deep(.el-menu-item) {
    clip-path: inset(3px 5px round 6px);

    &:active {
      background-color: var(--el-color-primary-light-7);
    }

    &.is-active {
      background-color: var(--el-menu-hover-bg-color);
    }
  }
}
</style>
