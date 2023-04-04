<script lang="ts" setup>
import { SettingCommon, SettingDatabase, SettingEasterEgg, SettingShortcutKey } from '.'

const activeName = ref('common')
</script>

<template>
  <div class="setting-panel p-4 flex flex-col gap-2">
    <el-alert type="warning" center :closable="false">
      设置云同步还在开发中，当前设置仅在该浏览器下生效。
    </el-alert>

    <el-tabs v-model="activeName" type="border-card" class="setting-tabs">
      <el-tab-pane label="常规" name="common" lazy>
        <SettingCommon />
      </el-tab-pane>

      <el-tab-pane label="数据库" name="database" lazy>
        <SettingDatabase />
      </el-tab-pane>

      <el-tab-pane label="快捷键" name="shortcut-keys" lazy>
        <SettingShortcutKey />
      </el-tab-pane>

      <el-tab-pane label="彩蛋" name="easter-egg" lazy>
        <SettingEasterEgg />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.setting-panel {
  width: 600px;
  height: 60vh;
  @media screen and (width < 600px) {
    width: 100vw;
  }
  &:deep(.el-tabs) {
    display: flex;
    flex-direction: column;
  }
  :deep(.el-tabs__header) {
    .el-tabs__item {
      transition: none;
    }
  }
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
    .el-tab-pane {
      height: 100%;
      overflow: hidden;
    }
  }
}

.setting-tabs {
  border-radius: 4px;
  overflow: hidden;
  flex: 1;
  :deep(.el-tabs__content) {
    padding: 0;
  }
}
</style>
