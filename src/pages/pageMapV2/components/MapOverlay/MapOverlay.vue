<script lang="ts" setup>
import type { OverlayGroup, OverlayManager } from '../../core'
import { useMap } from '../../hooks'
import { useOverlayStore } from '@/stores'

const props = defineProps<{
  optionGroup: OverlayGroup
}>()

const { map } = useMap()
const overlayStore = useOverlayStore()

const getOverlayManager = () => new Promise<OverlayManager>((resolve, reject) => {
  if (!map.value?.baseLayer)
    return reject(new Error('获取底图实例失败'))
  resolve(map.value.baseLayer.overlayManager)
})

const toggleVisible = async (id: string) => {
  const overlayManager = await getOverlayManager()
  overlayManager.toggleVisible(id)
  map.value?.baseLayer?.forceUpdate()
}

const width = computed(() => {
  const { 0: xmin, 2: xmax } = props.optionGroup.bounds
  return `${xmax - xmin}px`
})

const height = computed(() => {
  const { 1: ymin, 3: ymax } = props.optionGroup.bounds
  return `${ymax - ymin}px`
})

const overlayId = crypto.getRandomValues(new Uint8Array(8)).join('')

const menuvisible = computed(() => overlayStore.activeOverlayId === overlayId)

const activeMenu = () => {
  overlayStore.activeOverlayId = overlayId
}

const hideMenu = () => {
  overlayStore.activeOverlayId = ''
}
</script>

<template>
  <div class="gs-overlay-switch" :class="{ 'is-active': menuvisible }">
    <div
      v-if="!menuvisible"
      class="gs-overlay-switch-trigger cursor-pointer pointer-events-auto p-2"
      @pointerenter="activeMenu"
    >
      <Menu style="color: #49E8FF;" />
    </div>

    <div v-else class="gs-overlay-switch-wrapper" @pointerleave="hideMenu">
      <div
        v-for="option in optionGroup.children"
        :key="option.id"
        class="gs-overlay-switch-button"
        :class="{ actived: option.visible }"
        @click="() => toggleVisible(option.id)"
      >
        <div class="switch-icon" />
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-overlay-switch {
  --bounds-color: transparent;

  position: relative;
  pointer-events: none;

  &.is-active {
    --bounds-color: #49E8FF;
  }

  &::before {
    content: '';
    position: absolute;
    width: v-bind(width);
    height: v-bind(height);
    left: 0;
    top: 0;
    pointer-events: none;
    border: 2px solid var(--bounds-color);
    border-radius: 32px;
  }
}

.gs-overlay-switch-trigger {
  width: 64px;
  height: 64px;
  border: 2px solid #49E8FF;
  border-radius: 50%;
  translate: v-bind(width) v-bind(height);
  position: absolute;
  left: v-bind(width);
  top: v-bind(height);
  translate: -50% -50%;
  background: #272E39E0;
}

.gs-overlay-switch-wrapper {
  pointer-events: all;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: absolute;
  left: v-bind(width);
  top: v-bind(height);
  width: fit-content;
  background: #272E39E0;
  border-radius: 32px;
}

.gs-overlay-switch-button {
  --btn-border-color: #FFFFFF40;
  --btn-icon-scale: 0.8;
  --btn-color: #FFF;
  --btn-icon-offset: 0%;

  padding: 8px 16px 8px 8px;
  font-size: 24px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-family: 'MHYG';
  color: var(--btn-color);
  transition: all ease 150ms, --btn-icon-offset linear 150ms;

  &:hover {
    --btn-icon-scale: 1;
    --btn-border-color: #49E8FF;
    --btn-color: #DDD;
  }

  &:active {
    --btn-icon-scale: 0.9;
    --btn-border-color: #49E8FF60;
    --btn-color: #EEE;
  }

  &.actived {
    --btn-icon-scale: 1;
    --btn-border-color: transparent;
    --btn-color: #49E8FF;
    --btn-icon-offset: -5%;
  }
}

.switch-icon {
  --radius: 4px;
  --x-scale: 0.6;
  --x-radius: calc(var(--x-scale) * var(--radius));
  --y-offset: calc(40% - var(--btn-icon-offset, 0%));
  --y-gap: 6%;

  border: 2px solid var(--btn-border-color);
  height: 2em;
  width: 2em;
  border-radius: 50%;
  scale: var(--btn-icon-scale);
  transition: all ease 150ms;
  position: relative;
  filter: drop-shadow(0 0 2px color-mix(in srgb, transparent 50%, var(--btn-color)));

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% + var(--y-gap)) - var(--btn-icon-offset, 0%));
    width: 50%;
    height: 50%;
    background-color: color-mix(in srgb, var(--btn-color) 50%, #282a2c);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all linear 66ms;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% - var(--y-gap)) + var(--btn-icon-offset, 0%));
    width: 50%;
    height: 50%;
    background-color: color-mix(in srgb, var(--btn-color) 50%, #E6E6E6);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all linear 66ms;
  }
}
</style>
