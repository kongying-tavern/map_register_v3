<script lang="ts" setup>
import { IconPanel, IconTagPanel } from '@/pages/pageIconManager/components'
const activeName = ref('iconTag')
</script>

<template>
  <el-tabs v-model="activeName" class="icon-manager" type="card">
    <el-tab-pane label="图标标签" name="iconTag" lazy>
      <IconTagPanel />
    </el-tab-pane>

    <el-tab-pane label="图标" name="icon" lazy>
      <IconPanel />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.icon-manager {
  height: 100%;
  &.el-tabs.el-tabs--top {
    display: flex;
    flex-direction: column;
  }
  :deep(.el-tabs__header.is-top) {
    margin-bottom: 0.5rem;
  }
  :deep(.el-tabs__content) {
    flex: 1;
    .el-tab-pane {
      height: 100%;
    }
  }
}
</style>
