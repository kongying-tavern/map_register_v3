<script lang="ts" setup>
import { GSDivider } from '.'

const props = defineProps<{
  modelValue: string
  tabs: { title: string; value: string }[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()
</script>

<template>
  <div v-if="tabs.length" class="gs-tab">
    <div class="gs-tab-title">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="gs-tab-title__item"
        :class="{ actived: tab.value === props.modelValue }"
        @click="() => emits('update:modelValue', tab.value)"
      >
        {{ tab.title }}
      </div>
    </div>

    <GSDivider />

    <div class="gs-tab-content">
      <KeepAlive>
        <template v-for="tab in tabs">
          <slot v-if="tab.value === modelValue" :key="tab.value" :name="tab.value" />
        </template>
      </KeepAlive>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-tab {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

@mixin clip-shape() {
  clip-path: path('M 7.5 10 \
    A 20 20 0 0 0 20 0 \
    A 23 23 0 0 0 20 20 \
    A 20 20 0 0 0 7.5 10 \
    L 12.8377 10 \
    A 22 22 0 0 0 15.787 11.931 \
    A 25 25 0 0 0 15.787 8.069 \
    A 22 22 0 0 0 12.8377 10 \
    Z'
  );
}

.gs-tab-title {
  --arrow-size: 20px;
  font-size: 20px;
  background: #DCCAA8;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;
  gap: 2px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: calc(0px - var(--arrow-size));
    top: calc(50% - (var(--arrow-size) / 2));
    background: #E2D3B8;
    width: var(--arrow-size);
    height: var(--arrow-size);
    scale: 1.4;
    translate: -20% 0;
    @include clip-shape();
  }
  &::after {
    content: '';
    position: absolute;
    left: calc(100%);
    top: calc(50% - (var(--arrow-size) / 2));
    background: #E2D3B8;
    width: var(--arrow-size);
    height: var(--arrow-size);
    scale: 1.4;
    translate: 20% 0;
    rotate: 180deg;
    @include clip-shape();
  }
}

.gs-tab-title__item {
  --border-color: transparent;
  --border-width: 2px;
  cursor: pointer;
  text-align: center;
  min-width: 150px;
  color: #7F6B5B;
  border-radius: 999px;
  padding: 6px 24px;
  position: relative;
  transition: all 200ms ease;
  user-select: none;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    border: var(--border-width) solid var(--border-color);
    width: calc(100% - calc(2 * var(--border-width)));
    height: calc(100% - calc(2 * var(--border-width)));
    transform: translate(var(--border-width), var(--border-width));
    border-radius: 999px;
  }
  &:hover {
    color: #FFF;
  }
  &:active {
    background: #F7F3EC;
    color: #7F6B5B;
    --border-color: #ECE5D8;
  }
  &.actived {
    background: #F7F3EC;
    color: #7F6B5B;
    --border-color: #ECE5D8;
  }
}

.gs-tab-content {
  width: 100%;
  flex: 1;
  overflow: hidden;
}
</style>
