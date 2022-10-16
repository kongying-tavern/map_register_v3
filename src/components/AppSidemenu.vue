<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const routeItems = computed(
  () => route.matched.find(item => item.path === '/')?.children ?? [],
)
</script>

<template>
  <el-menu :default-active="route.path" router class="app-sidemenu h-full">
    <el-menu-item
      v-for="item in routeItems"
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
