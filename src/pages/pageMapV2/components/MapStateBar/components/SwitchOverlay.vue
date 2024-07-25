<script setup lang="ts">
import BarItem from './BarItem.vue'
import { MapOverlayController, MapWindowTeleporter, mapWindowContext as windowCtx } from '@/pages/pageMapV2/components'
import { useOverlayStore } from '@/stores'

const overlayStore = useOverlayStore()

const overlayCache = ref(new Set(overlayStore.activedItemIds))
const cachable = ref(false)

const id = crypto.randomUUID()

const MIN_WIDTH = window.matchMedia('(min-width: 600px)').matches ? 440 : 240

const overlayVisible = computed({
  get: () => Boolean(windowCtx.getWindow(id)),
  set: (visible) => {
    if (!visible) {
      windowCtx.closeWindow(id)
      return
    }
    cachable.value = true
    const { clientWidth } = document.body
    overlayStore.activedItemIds = overlayCache.value
    windowCtx.openWindow({
      id,
      name: '附加图层控制器',
      minWidth: MIN_WIDTH,
      minHeight: 420,
      x: clientWidth - MIN_WIDTH - 6,
      y: 8,
      beforeClose: () => {
        cachable.value = false
        overlayStore.activedItemIds.clear()
        return true
      },
    })
  },
})

watch(() => overlayStore.activedItemIds.size, () => {
  if (!cachable.value)
    return
  overlayCache.value = new Set(overlayStore.activedItemIds)
})
</script>

<template>
  <BarItem
    divider
    :label="`附加图层：${overlayVisible ? '显示' : '隐藏'}`"
    @click="overlayVisible = !overlayVisible"
  >
    <template #default>
      <div
        class="overlay-status-button grid place-items-center"
        :class="{
          'is-actived': overlayVisible,
        }"
      />

      <MapWindowTeleporter :id="id">
        <MapOverlayController />
      </MapWindowTeleporter>
    </template>
  </BarItem>
</template>

<style scoped>
.overlay-status-button {
  --collapse-size: 32px;
  --btn-icon-offset: -2%;
  --btn-icon-color: gray;
  --radius: 4px;
  --x-scale: 0.6;
  --x-radius: calc(var(--x-scale) * var(--radius));
  --y-offset: calc(40% - var(--btn-icon-offset, 0%));
  --y-gap: 6%;
  --timing: cubic-bezier(0.67, 2.22, 0.93, 1.23);

  width: var(--collapse-size);
  height: var(--collapse-size);
  outline-offset: -6px;
  cursor: pointer;
  transition: all ease 150ms;
  position: relative;

  &.is-actived {
    --btn-icon-offset: -10%;
    --btn-icon-color: #1CFFFF;
  }

  &:active {
    scale: 0.9;
  }

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% + var(--y-gap)) - var(--btn-icon-offset, 0%));
    width: 60%;
    height: 60%;
    background-color: color-mix(in srgb, var(--btn-icon-color) 50%, #282a2c);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all ease 150ms;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% - var(--y-gap)) + var(--btn-icon-offset, 0%));
    width: 60%;
    height: 60%;
    background-color: color-mix(in srgb, var(--btn-icon-color) 50%, #CCCCCCC0);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all ease 150ms;
  }
}
</style>
