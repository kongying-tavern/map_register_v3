<script lang="ts" setup>
import type { GSMapState } from '@/stores/types/genshin-map-state'

const props = defineProps<{
  data: GSMapState.MarkerWithRenderConfig
  isHover: boolean
  isFocus: boolean
}>()

const emits = defineEmits<{
  hover: [GSMapState.MarkerWithRenderConfig | null]
  focus: [GSMapState.MarkerWithRenderConfig]
}>()
</script>

<template>
  <div
    class="marker-card"
    :class="{
      'is-hover': isHover,
      'is-focus': isFocus,
    }"
    @click="() => emits('focus', data)"
    @pointerenter="() => emits('hover', data)"
    @pointerleave="() => emits('hover', null)"
  >
    <div class="card-wrapper">
      <div>area</div>
      <div class="">
        {{ props.data.markerTitle }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.marker-card {
  --bg: #F4EFE280;
  --ol-color: transparent;
  --ol-style: dashed;
  --ol-offset: 2px;
  --ol-width: 2px;

  height: 100%;
  overflow: hidden;
  padding: 4px 6px 4px 6px;

  &:hover, &.is-hover {
    --bg: #F4EFE2B0;
    --ol-color: #FFFF00;
  }

  &:active {
    --bg: #F4EFE2F0;
  }

  &.is-focus {
    --ol-style: solid;
    --ol-color: #FFFF00;
    --ol-offset: 0px;
  }
}

.card-wrapper {
  outline: var(--ol-width) var(--ol-style) var(--ol-color);
  outline-offset: var(--ol-offset);
  height: 100%;
  background: var(--bg);
  border-radius: 6px;
  padding: 4px;
  transition: all ease 100ms;
  display: grid;
  grid-template-columns: 44px auto;
}
</style>
