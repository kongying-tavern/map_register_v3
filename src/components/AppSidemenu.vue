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
      {{ item.meta?.title }}
    </el-menu-item>
  </el-menu>
</template>

<style lang="scss" scoped>
.app-sidemenu {
  border-right: none;
}
</style>
