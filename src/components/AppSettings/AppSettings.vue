<script lang="ts" setup>
import SettingItem from './SettingItem.vue'
import { localSettings } from '@/stores'
</script>

<template>
  <div class="setting-panel p-4 flex flex-col">
    <SettingItem label="自动定位加载点" content="点位加载完毕后移动到点集的几何中心">
      <el-switch v-model="localSettings.moveToCenter" />
    </SettingItem>

    <SettingItem label="自动跳转筛选器" content="筛选器满足选择条件时自动跳转到下一级">
      <el-switch v-model="localSettings.autoTurnNext" />
    </SettingItem>
  </div>
</template>

<style lang="scss" scoped>
.setting-panel {
  min-width: 820px;
}
</style>
