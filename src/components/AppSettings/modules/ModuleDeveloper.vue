<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { usePreferenceStore } from '@/stores'
import { useBanner } from '@/hooks'

const { preference } = storeToRefs(usePreferenceStore())

const { visible } = useBanner()
</script>

<template>
  <SettingPanel>
    <SettingGroup name="调试">
      <SettingBar label="banner" note="banner 控制器">
        <template #setting>
          <el-switch v-model="visible" />
        </template>
      </SettingBar>
    </SettingGroup>

    <SettingGroup name="日志">
      <SettingBar label="Service Worker" note="是否隐藏 Service Worker 触发缓存时的日志">
        <template #setting>
          <el-switch v-model="preference['developer.setting.hideServiceWorkerLogger']" />
        </template>
      </SettingBar>

      <SettingBar label="数据库后台更新" note="是否隐藏数据库后台更新的日志">
        <template #setting>
          <el-switch v-model="preference['developer.setting.hideDatabaseUpdaterLogger']" />
        </template>
      </SettingBar>

      <SettingBar label="图层组" note="是否隐藏图层组的日志">
        <template #setting>
          <el-switch v-model="preference['developer.setting.hideCompositeLayerLogger']" />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
