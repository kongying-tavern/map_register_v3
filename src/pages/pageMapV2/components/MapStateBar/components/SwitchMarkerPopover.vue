<script setup lang="ts">
import { ChatSquare } from '@element-plus/icons-vue'
import BarItem from './BarItem.vue'
import { usePreferenceStore } from '@/stores'

const preferenceStore = usePreferenceStore()

const isPopoverHide = computed({
  get: () => preferenceStore.preference['map.setting.hideMarkerPopover'],
  set: (v) => {
    preferenceStore.preference['map.setting.hideMarkerPopover'] = v
  },
})
</script>

<template>
  <BarItem divider :label="`点位弹窗：${isPopoverHide ? '隐藏' : '显示'}`">
    <div
      class="w-8 h-8 relative grid place-items-center"
      :class="{
        'text-[var(--el-color-danger)]': isPopoverHide,
      }"
      @click="isPopoverHide = !isPopoverHide"
    >
      <div
        class="w-5 h-5 absolute"
        :class="{
          'hide-shape': isPopoverHide,
        }"
      />
      <el-icon
        :size="20"
        :class="{
          'hide-mask': isPopoverHide,
        }"
      >
        <ChatSquare />
      </el-icon>
    </div>
  </BarItem>
</template>

<style scoped>
.hide-shape {
  --size: 0.5px;

  background: linear-gradient(
    45deg,
    transparent 0 calc(50% - var(--size)),
    currentColor calc(50% - var(--size)) calc(50% + var(--size)),
    transparent calc(50% + var(--size)) 100%
  );
}

.hide-mask {
  --gap: 2px;

  mask: linear-gradient(
    45deg,
    #000 0 calc(50% - var(--gap)),
    transparent calc(50% - var(--gap)) calc(50% + var(--gap)),
    #000 calc(50% + var(--gap)) 100%
  );
}
</style>
