<script setup lang="ts">
import { Brush } from '@element-plus/icons-vue'
import { SettingBar, SettingGroup, SettingPanel, ShortcutKey } from '../components'
import { usePreferenceStore } from '@/stores'
import { getDefaultPreference } from '@/stores/types'

const preferenceStore = usePreferenceStore()
</script>

<template>
  <SettingPanel>
    <SettingGroup name="主题">
      <SettingBar label="切换黑暗模式快捷键" :icon="Brush">
        <template #setting>
          <ShortcutKey
            v-model="preferenceStore.preference['app.shortcutKey.toggleDarkMode']"
            :default-value="getDefaultPreference()['app.shortcutKey.toggleDarkMode']"
          />
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
