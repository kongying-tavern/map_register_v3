<script lang="ts" setup>
/**
 * 需要注意，由于当前组件是手动渲染到 leaflet marker DOM 节点上的。
 * 由于缺少 app 上下文，无法使用依赖注入与生命周期钩子（inject、pinia、hooks 等）。
 * 但是响应式系统本身还是能使用的（如 props、ref 等）。
 */
import { ElIcon } from 'element-plus'
import { Plus, Refresh, Setting } from '@element-plus/icons-vue'
import type L from 'leaflet'
import { ceil } from 'lodash'

const props = defineProps<{
  latlng: L.LatLng
  selectedArea?: API.AreaVo
  hasPunctauteRights: boolean
}>()

const emits = defineEmits<{
  (e: 'command', v: string): void
}>()

const createMarker = () => {
  if (!props.hasPunctauteRights || !props.selectedArea)
    return
  emits('command', 'add')
}
</script>

<template>
  <div
    class="context-menu w-full h-full rounded-md grid grid-cols-2 grid-rows-2 gap-2 text-white shadow-xl text-sm"
  >
    <div
      data-command="add"
      class="context-menu-item rounded col-span-2"
      :class="{ disabled: !hasPunctauteRights || !selectedArea }"
      :title="!hasPunctauteRights ? '没有权限' : !selectedArea ? '未选择地区' : undefined"
      @click="createMarker"
    >
      <ElIcon><Plus /></ElIcon>
      <div>新增点位</div>
      <div>({{ ceil(latlng.lat, 2) }}, {{ ceil(latlng.lng, 2) }})</div>
    </div>

    <div data-command="refresh" class="context-menu-item" @click="() => emits('command', 'refresh')">
      <ElIcon><Refresh /></ElIcon>
      <div>刷新点位</div>
    </div>

    <div data-command="setting" class="context-menu-item" @click="() => emits('command', 'setting')">
      <ElIcon><Setting /></ElIcon>
      <div>设置</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  &::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 0;
    top: 0;
    transform: translate(-16px, -16px);
    pointer-events: none;
    border: solid red;
    border-width: 4px 0 0 4px;
  }
}

.context-menu-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px;
  gap: 4px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background-color ease 100ms;
  &:not(.disabled) {
    &:hover {
      background-color: rgba(87 83 78 / 0.7);
    }
    &:active {
      background-color: rgba(120 113 118 / 0.7);
    }
  }
  &.disabled {
    color: gray;
    cursor: not-allowed;
  }
}
</style>
