<script setup lang="ts">
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { useSocketStore } from '@/stores'

const socketStore = useSocketStore()
</script>

<template>
  <SettingPanel>
    <SettingGroup name="Web Socket">
      <SettingBar label="响应时延" note="当前检测间隔: 5s">
        <template #setting>
          {{ socketStore.delay }} ms
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
