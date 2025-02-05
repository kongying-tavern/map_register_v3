<script setup lang="ts">
import { MarkerCreation } from './components'

const tabName = ref(1)
</script>

<template>
  <el-tabs v-model="tabName" class="contribution-container">
    <el-tab-pane label="点位创建" :name="1" lazy>
      <MarkerCreation />
    </el-tab-pane>

    <el-tab-pane label="综合评分" :name="2" lazy>
      B
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
.contribution-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  :deep(.el-tabs__content) {
    width: 100%;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    overflow: hidden;
  }

  :deep(.el-tabs__header.is-top) {
    margin: 0 12px;
    margin-bottom: 0;
  }
}
</style>
