<script setup lang="ts">
import {
  PaintMarkerLink,
  SwitchMarkerPopover,
  SwitchOverlay,
  ViewState,
} from './components'
import { useAccessStore } from '@/stores'

const accessStore = useAccessStore()

const virtualRef = ref<HTMLElement>()
const contentZoneRef = ref<HTMLElement>()

const tooltipContent = ref('')

onClickOutside(contentZoneRef, () => {
  virtualRef.value = undefined
})

const checkTooltip = (ev: Event) => {
  const findRes = ev.composedPath().find((target) => {
    return target instanceof HTMLElement && target.dataset.label
  })
  if (!findRes) {
    virtualRef.value = undefined
    return
  }
  virtualRef.value = findRes as HTMLElement
  tooltipContent.value = (findRes as HTMLElement).dataset.label ?? ''
}
useEventListener(contentZoneRef, 'pointermove', checkTooltip)
useEventListener(contentZoneRef, 'click', checkTooltip)
</script>

<template>
  <div class="map-state-bar">
    <div ref="contentZoneRef" class="bar-content">
      <PaintMarkerLink v-if="accessStore.get('MARKER_LINK')" />
      <SwitchMarkerPopover />
      <SwitchOverlay />
      <ViewState />
    </div>

    <el-tooltip
      :visible="Boolean(tooltipContent && virtualRef)"
      :virtual-ref="virtualRef"
      :content="tooltipContent"
      :offset="8"
      popper-class="state-bar-tooltip genshin-text"
      placement="top"
      effect="customized"
      virtual-triggering
    />
  </div>
</template>

<style lang="scss">
.el-popper.is-customized.state-bar-tooltip {
  padding: 2px 4px;
  background: #ECE5D8;
  color: #495168;
  font-size: 12px;
  .el-popper__arrow {
    display: none;
  }
}
</style>

<style scoped>
.map-state-bar {
  max-width: 100dvw;
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 9;
  padding: 0 4px 4px;
  background-clip: content-box;
  pointer-events: none;
}

.bar-content {
  border-radius: 4px;
  background: #C6C2BA;
  color: #263240;
  padding: 2px;
  pointer-events: all;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
