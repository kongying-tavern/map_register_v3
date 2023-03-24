<script lang="ts" setup>
import { SettingCommon, SettingDatabase } from '.'

const activeName = ref('common')
</script>

<template>
  <div class="setting-panel p-4 flex flex-col gap-2">
    <el-alert type="warning" center :closable="false">
      设置云同步还在开发中，当前设置仅在该浏览器下生效。
    </el-alert>

    <el-tabs v-model="activeName" type="border-card" class="setting-tabs">
      <el-tab-pane label="常规" name="common">
        <SettingCommon />
      </el-tab-pane>

      <el-tab-pane label="数据库" name="database">
        <SettingDatabase />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.setting-panel {
  width: 600px;
  :deep(.el-tabs__header) {
    .el-tabs__item {
      transition: none;
    }
  }
}

.setting-tabs {
  border-radius: 4px;
  overflow: hidden;
  :deep(.el-tabs__content) {
    padding: 0;
  }
}
</style>
