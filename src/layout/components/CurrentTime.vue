<script setup lang="ts">
import { now } from '@/shared'
</script>

<template>
  <div class="h-full flex items-center px-1">
    <div class="w-[112px] text-xs text-[var(--el-text-color-regular)]">
      {{ new Date(now).toLocaleString() }}
    </div>
  </div>
</template>
