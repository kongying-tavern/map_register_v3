<script setup lang="ts">
import { Brush, Crop } from '@element-plus/icons-vue'
import { SettingBar, SettingGroup, SettingPanel, ShortcutKey } from '../components'
import { usePreferenceStore } from '@/stores'
import { getDefaultPreference } from '@/stores/types'

const preferenceStore = usePreferenceStore()

const defaultPreference = getDefaultPreference()
</script>

<template>
  <SettingPanel>
    <SettingGroup name="快捷键">
      <SettingBar label="切换黑暗模式" :icon="Brush">
        <template #setting>
          <ShortcutKey
            v-model="preferenceStore.preference['app.shortcutKey.toggleDarkMode']"
            :default-value="defaultPreference['app.shortcutKey.toggleDarkMode']"
          />
        </template>
      </SettingBar>

      <SettingBar label="地图界面多选点位" :icon="Crop">
        <template #setting>
          <ShortcutKey
            v-model="preferenceStore.preference['app.shortcutKey.multiselectMarker']"
            :default-value="defaultPreference['app.shortcutKey.multiselectMarker']"
          />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
