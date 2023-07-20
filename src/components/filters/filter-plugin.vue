<script setup>
import FilterComment from "./filter-comment.vue";
import { filterCardToggle, filterMuteTooltip } from "./data";
</script>

<template>
  <div class="relative-position">
    <!-- 内容区 -->
    <div class="wrapper">
      <q-icon
        class="cursor-pointer"
        style="flex: none"
        size="md"
        name="mdi-filter-outline"
        @click="filterCardToggle"
      >
      </q-icon>
      <FilterComment style="flex: auto"></FilterComment>
      <q-btn
        style="flex: none"
        unelevated
        rounded
        dense
        size="md"
        :color="filterMuteTooltip ? 'grey-1' : 'pink-4'"
        :text-color="filterMuteTooltip ? 'pink-4' : 'grey-1'"
        :icon="
          filterMuteTooltip ? 'mdi-tooltip-outline' : 'mdi-tooltip-text-outline'
        "
        @click="filterMuteTooltip = !filterMuteTooltip"
      >
        <q-tooltip>
          <template v-if="filterMuteTooltip">开启筛选按钮提示</template>
          <template v-else>关闭筛选按钮提示</template>
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  overflow: visible;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
