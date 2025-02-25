<script setup lang="ts">
import Api from '@/api/api'
import { useFetchHook } from '@/hooks'

const { refresh: refreshApp, loading: refreshLoading } = useFetchHook({
  onRequest: () => Api.app.triggerAppUpdate(),
})
</script>

<template>
  <div class="w-full h-full overflow-hidden text-sm">
    <div class="m-2 p-2 flex justify-between items-center gap-2 rounded-lg border border-[var(--el-color-info-light-5)]">
      <el-text class="flex-1">
        发送刷新信号，将会导致所有在线用户刷新页面
      </el-text>
      <el-button class="shrink-0" :loading="refreshLoading" @click="refreshApp">
        刷新应用
      </el-button>
    </div>
  </div>
</template>
