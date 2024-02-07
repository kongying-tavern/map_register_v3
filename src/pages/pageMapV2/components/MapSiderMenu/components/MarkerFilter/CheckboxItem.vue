<script lang="ts" setup generic="R extends unknown = unknown">
defineProps<{
  label?: string
  isActived: boolean
  props?: R
  draggable?: boolean
}>()
</script>

<template>
  <div
    :class="{ actived: isActived }"
    :draggable="draggable ? 'true' : 'false'"
    class="checkbox-item"
    v-bind="$attrs"
  >
    <div v-if="$slots.icon" class="checkbox-item__icon">
      <slot name="icon" :props="props" :actived="isActived" />
    </div>

    <slot name="default" :props="props" :actived="isActived">
      <div class="checkbox-item__content overflow-hidden" :class="{ 'no-icon': !$slots.icon }" :title="label">
        {{ label }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.checkbox-item {
  --outline-color: #E3DDD180;
  --outline-width: 2px;
  --outline-offset: calc(0px - var(--outline-width));
  --color: #E4DDD1;
  --item-height: 48px;
  --item-bg: transparent;
  --icon-bg: color-mix(in srgb, #FFF 20%, #263240);

  height: var(--item-height);
  margin: 2px;
  display: flex;
  align-items: center;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color);
  background-color: var(--item-bg);
  outline-offset: var(--outline-offset);
  outline: var(--outline-width) solid var(--outline-color);
  transition: all ease 150ms, outline-offset linear 50ms;
  border-radius: 6px;
  user-select: none;

  &:hover {
    --outline-color: #F3EEE6;
    outline-offset: 0px;
  }
  &:active {
    outline-offset: var(--outline-offset);
  }
  &.actived {
    --color: #263240;
    --item-bg: #E4DDD1;
    --icon-bg: color-mix(in srgb, #FFF 60%, #263240);
  }
}

.checkbox-item__icon {
  height: 100%;
  aspect-ratio: 1 / 1;
  padding: 8px;
  display: grid;
  background-color: var(--icon-bg);
  place-items: center;
  transition: all ease 150ms;
  pointer-events: none;
}

.checkbox-item__content {
  height: 100%;
  flex: 1;
  padding: 8px;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  line-height: 1;
  overflow: hidden;
  &.no-icon {
    padding: 8px 16px;
  }
}
</style>
