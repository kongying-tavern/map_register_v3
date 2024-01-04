<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { usePreferenceStore } from '@/stores'

const { preference } = storeToRefs(usePreferenceStore())

const showServiceWorkerLogger = computed({
  get: () => !preference.value['developer.setting.hideServiceWorkerLogger'],
  set: (v) => {
    preference.value['developer.setting.hideServiceWorkerLogger'] = !v
  },
})
</script>

<template>
  <SettingPanel>
    <SettingGroup name="日志">
      <SettingBar label="Service Worker" note="是否显示 Service Worker 触发缓存时的日志">
        <template #setting>
          <el-switch v-model="showServiceWorkerLogger" />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
