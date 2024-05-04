<script setup lang="ts">
import { SettingBar, SettingGroup, SettingPanel } from '../components'
import { useSocketStore } from '@/stores'

const socketStore = useSocketStore()

const text = computed(() => {
  return socketStore.status === WebSocket.OPEN
    ? `${socketStore.delay} ms`
    : '未连接'
})
</script>

<template>
  <SettingPanel>
    <SettingGroup name="Web Socket">
      <SettingBar label="响应时延" note="当前检测间隔: 5s">
        <template #setting>
          {{ text }}
        </template>
      </SettingBar>

      <SettingBar label="操作">
        <template #setting>
          <el-button @click="socketStore.connect">
            连接
          </el-button>
        </template>
      </SettingBar>
    </SettingGroup>
  </SettingPanel>
</template>
