<script lang="ts" setup>
export interface GSButtonProps {
  icon?: 'submit' | 'cancel'
  iconSize?: string | number
  iconColor?: string
  dark?: boolean
  disabled?: boolean
  loading?: boolean
}

export interface GSButtonEmits {
  (e: 'click', v: MouseEvent): void
}

const props = defineProps<GSButtonProps>()
const emits = defineEmits<GSButtonEmits>()

const onClick = (ev: MouseEvent) => {
  if (props.disabled || props.loading)
    return
  emits('click', ev)
}
</script>

<template>
  <button v-bind="$attrs" class="gs-button genshin-text" :class="{ dark, loading, disabled }" @click="onClick">
    <div v-if="loading" class="gs-button-icon loading" />
    <div v-else-if="icon || $slots.icon" class="gs-button-icon" :class="[$slots.icon ? '' : icon]">
      <slot name="icon" />
    </div>
    <div v-if="$slots.default" class="gs-button-content">
      <slot name="default" />
    </div>
  </button>
</template>

<style lang="scss" scoped>
.gs-button {
  --icon-opacity: 1;
  // background
  --bg-opacity: 1;
  --bg-active-opacity: 0.6;
  --bg: rgb(236 229 216 / var(--bg-opacity));
  // color
  --text-color: #4A5366;
  --text-active-color: #FFF;
  // outline
  --outline-color: transparent;
  --outline-hover-color: #FFF;
  --outline-active-color: transparent;
  // border
  --border-color: transparent;
  --border-hover-color: #DAD4CB;
  --border-active-color: transparent;
  // filter
  --filter: drop-shadow(0 0 2px rgb(128 128 128 / 0.4));
  --filter-active: drop-shadow(0 0 6px rgb(128 128 128 / 0.4));

  display: flex;
  width: fit-content;
  height: 40px;
  padding: 5px;
  border-radius: 20px;
  outline: 2px solid var(--outline-color);
  border: 2px solid var(--border-color);
  transition:
    all 150ms ease,
    background 150ms cubic-bezier(0, 3, 0, 2);
  background: var(--bg);
  color: var(--text-color);
  filter: var(--filter);
  font-size: 18px;
  position: relative;

  &:hover {
    outline-color: var(--outline-hover-color);
    border-color: var(--border-hover-color);
  }
  &:active {
    --bg-opacity: var(--bg-active-opacity);
    --icon-opacity: 0.8;
    color: var(--text-active-color);
    outline-color: var(--outline-active-color);
    border-color: var(--border-active-color);
    filter: var(--filter-active);
  }
  &.dark {
    --text-color: #ECE5D8;
    --text-active-color: #5B6272;
    --border-hover-color: rgb(91 98 114 / var(--bg-opacity));
    --bg-active-opacity: 0.1;
    --bg: rgb(74 83 102 / var(--bg-opacity));
    --outline-active-color: #5B6272;
    --filter-active: drop-shadow(0 0 2px #DAD4CB);
  }
  @mixin plainStyle($cursor: default) {
    cursor: $cursor;
    --icon-opacity: 1;
    --bg: transparent;
    --outline-color: #ece5d834;
    --outline-hover-color: var(--outline-color);
    --outline-active-color: var(--outline-color);
    --border-color: transparent;
    --border-hover-color: var(--border-color);
    --border-active-color: var(--border-color);
    --filter-active: none;
    --text-color: #959597;
    --text-active-color: var(--text-color);
    --filter: none;
    --filter-active: none;
  }
  &:not(.disabled).loading.loading {
    @include plainStyle();
  }
  &.disabled.disabled {
    @include plainStyle($cursor: not-allowed);
  }
}

.gs-button-icon {
  width: 26px;
  aspect-ratio: 1 / 1;
  border-radius: 100%;
  background: #313131;
  opacity: var(--icon-opacity);
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  &::before, &::after {
    content: '';
    left: 0;
    top: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 100%;
  }
  &.submit::before {
    border: 4px solid #FAC732;
    scale: 0.5 0.5;
  }
  &.cancel::before {
    background: #38A2E4;
    border-radius: 2px;
    height: 4px;
    rotate: 45deg;
    translate: 0 11px;
    scale: 0.6;
  }
  &.cancel::after {
    background: #38A2E4;
    border-radius: 2px;
    height: 4px;
    rotate: -45deg;
    translate: 0 11px;
    scale: 0.6;
  }
  &.loading::before {
    @keyframes anime-rotate {
      from { rotate: 0deg; }
      to { rotate: 360deg; }
    }
    background: repeating-conic-gradient(
      transparent 0%,
      #FAC732 33%,
    );
    mask: radial-gradient(transparent 0, transparent 50%, #000 50%, #000);
    animation: anime-rotate 2000ms linear infinite;
    scale: 0.6;
  }
}

.gs-button-content {
  white-space: nowrap;
  padding: 0 8px;
  flex: 1;
}
</style>
