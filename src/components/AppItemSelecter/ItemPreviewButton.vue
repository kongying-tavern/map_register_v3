<script lang="ts" setup>
import { CircleCloseFilled, Close } from '@element-plus/icons-vue'

defineProps<{
  item: API.ItemVo
  iconMap: Record<string, API.TagVo>
}>()
</script>

<template>
  <div
    v-bind="$attrs"
    :title="item.name"
    class="item-selecter-button relative"
  >
    <el-image :src="iconMap[item.iconTag ?? '']?.url" crossorigin="" fit="contain" class="w-8 h-8">
      <template #error>
        <el-icon :size="32" color="var(--el-color-danger)">
          <Close />
        </el-icon>
      </template>
    </el-image>

    <div class="absolute w-3 h-3 top-0 right-0">
      <CircleCloseFilled />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-selecter-button {
  width: 40px;
  height: 40px;
  padding: 4px;
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
