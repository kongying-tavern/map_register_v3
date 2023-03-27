<script lang="ts" setup>
import SettingItem from './SettingItem.vue'
import { localSettings } from '@/stores'
</script>

<template>
  <el-scrollbar>
    <div class="flex flex-col">
      <el-alert :closable="false">
        彩蛋类型设置项会在在使用空荧后厨的过程中自动解锁
      </el-alert>

      <SettingItem
        label="卡半岩"
        content="是否在加载的时候呈现经典卡半岩动画"
      >
        <el-switch v-model="localSettings.waittingGeo" />
      </SettingItem>
    </div>
  </el-scrollbar>
</template>
