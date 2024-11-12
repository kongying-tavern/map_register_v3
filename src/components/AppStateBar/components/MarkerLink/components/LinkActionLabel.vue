<script setup lang="ts">
import {
  LINK_ACTION_CONFIG,
  LINK_ACTION_NAME_MAP,
} from '@/shared'
import type { LinkActionEnum } from '@/shared'

defineProps<{
  value: LinkActionEnum
}>()
</script>

<template>
  <div class="w-full h-full overflow-hidden flex items-center gap-1">
    <div
      class="w-[3px] h-[14px] shrink-0 bg-[var(--bg)]"
      :style="{ '--bg': `rgba(${LINK_ACTION_CONFIG[value].lineColor.join(' ')})` }"
    />
    <div class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
      {{ LINK_ACTION_NAME_MAP.get(value) }}
    </div>
  </div>
</template>
