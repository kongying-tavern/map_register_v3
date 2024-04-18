<script lang="ts" setup>
import { AppIconTagRenderer } from '@/components'

defineProps<{
  itemType: API.ItemTypeVo
  nums?: number
  actived: boolean
  src?: string
  mapping?: [number, number]
}>()
</script>

<template>
  <div
    :title="itemType.name"
    :class="{ actived }"
    class="type-select-button flex items-center rounded p-1 pr-3"
  >
    <AppIconTagRenderer
      :src="src"
      :mapping="mapping"
      class="w-8 h-8 flex-shrink-0"
    />
    <el-badge
      type="primary"
      :value="nums ?? 0"
      :hidden="!nums"
      style="width: 100%"
      class="pl-1"
    >
      <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ itemType.name }}</span>
    </el-badge>
  </div>
</template>

<style scoped>
.type-select-button {
  &:not(.actived):hover {
    background-color: var(--el-color-primary-light-9);
  }
  &:not(.actived):active {
    background-color: var(--el-color-primary-light-7);
  }
  &.actived {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
  }
}
</style>
