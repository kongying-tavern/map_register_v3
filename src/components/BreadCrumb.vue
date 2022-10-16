<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="item in route.matched"
      :key="item.path"
      :to="item.path"
    >
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
