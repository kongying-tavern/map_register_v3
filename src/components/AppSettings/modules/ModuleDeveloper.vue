<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { usePreferenceStore } from '@/stores'
import { useBanner } from '@/hooks'

const { preference } = storeToRefs(usePreferenceStore())

const showServiceWorkerLogger = computed({
  get: () => !preference.value['developer.setting.hideServiceWorkerLogger'],
  set: (v) => {
    preference.value['developer.setting.hideServiceWorkerLogger'] = !v
  },
})

const showDatabaseUpdaterLogger = computed({
  get: () => !preference.value['developer.setting.hideDatabaseUpdaterLogger'],
  set: (v) => {
    preference.value['developer.setting.hideDatabaseUpdaterLogger'] = !v
  },
})

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
      <SettingBar label="Service Worker" note="是否显示 Service Worker 触发缓存时的日志">
        <template #setting>
          <el-switch v-model="showServiceWorkerLogger" />
        </template>
      </SettingBar>
      <SettingBar label="数据库后台更新" note="是否显示数据库后台更新的日志">
        <template #setting>
          <el-switch v-model="showDatabaseUpdaterLogger" />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
