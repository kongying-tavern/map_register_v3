<script lang="ts" setup>
import { Select } from '@element-plus/icons-vue'
import { AppIconTagRenderer } from '@/components'

defineProps<{
  item: API.ItemVo
  iconMap: Record<string, API.TagVo>
  actived: boolean
  src?: string
  mapping?: [number, number]
}>()
</script>

<template>
  <div
    v-bind="$attrs"
    :title="item.name"
    class="item-selecter-button flex"
  >
    <div
      class="w-4 h-4 border rounded-full grid place-items-center"
      style="border-color: var(--el-border-color);"
      :style="[
        actived
          ? 'background-color: var(--el-color-primary); border-color: var(--el-color-primary); color: #FFF;'
          : 'color: transparent;',
      ]"
    >
      <el-icon :size="14" color="currentColor">
        <Select />
      </el-icon>
    </div>

    <AppIconTagRenderer
      :src="src"
      :mapping="mapping"
      class="w-8 h-8 flex-shrink-0"
    />

    <el-text truncated>
      {{ item.name }}
    </el-text>

    <slot name="append" />
  </div>
</template>

<style lang="scss" scoped>
.item-selecter-button {
  height: 40px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  user-select: none;
  content-visibility: auto;

  &:hover {
    background-color: var(--el-color-info-light-9);
  }
  &:active {
    background-color: var(--el-color-info-light-8);
  }
}
</style>
