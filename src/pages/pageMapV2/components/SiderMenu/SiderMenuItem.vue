<script lang="ts" setup>
import type { Component } from 'vue'
import { contentRefKey, tabNameRefKey } from '.'

const props = defineProps<{
  label: string
  name: string
  icon: Component
}>()

const contentRef = inject(contentRefKey, ref(null))
const tabNameRef = inject(tabNameRefKey, ref())

const actived = computed(() => tabNameRef.value === props.name)
</script>

<template>
  <div class="sider-menu-tab" :class="{ actived }" @click="tabNameRef = name">
    <div class="sider-menu-tab-button" :data-tab-label="label">
      <component :is="icon" style="color: var(--icon-color)" />
    </div>
  </div>

  <Teleport v-if="contentRef && tabNameRef === name" :to="contentRef">
    <slot name="default" />
  </Teleport>
</template>

<style lang="scss" scoped>
.sider-menu-tab {
  --icon-color: #D3BC8E;
  --scale: 1;
  --button-bg: transparent;

  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 15px;

  &:hover {
    --scale: 1.1;
    --button-bg: #3B4554;
    --icon-color: #ECE5D8;
  }
  &:active, &.actived {
    --button-bg: #ECE5D8;
    --icon-color: #3B4255;
  }
}

.sider-menu-tab-button {
  padding: 5px;
  scale: var(--scale);
  border-radius: 50%;
  background: var(--button-bg);
  transition: all ease 150ms;
}
</style>
