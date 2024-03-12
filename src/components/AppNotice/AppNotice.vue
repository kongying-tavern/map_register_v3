<script setup lang="ts">
import { ChatLineRound } from '@element-plus/icons-vue'
import { context } from './context'
</script>

<template>
  <el-button
    class="app-notice-button"
    text
    size="large"
    style="--el-border-radius-base: 8px; padding: 8px 12px;"
    @click="context.show"
  >
    <el-icon :size="20">
      <ChatLineRound />
    </el-icon>
  </el-button>
</template>

<style scoped>
.app-notice-button {
}
</style>
