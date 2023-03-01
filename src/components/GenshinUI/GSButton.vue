<script lang="ts" setup>
const props = defineProps<{
  icon?: 'submit'
  dark?: boolean
  disabled?: boolean
  loading?: boolean
}>()

const emits = defineEmits<{
  (e: 'click', v: MouseEvent): void
}>()

const onClick = (ev: MouseEvent) => {
  if (props.disabled || props.loading)
    return
  emits('click', ev)
}
</script>

<template>
  <button class="gs-button" :class="{ dark }" @click="onClick">
    <div class="gs-button-icon" :class="[icon]" />
    <div class="gs-button-content">
      <slot name="default" />
    </div>
  </button>
</template>

<style lang="scss" scoped>
.gs-button {
  --bg-opacity: 1;
  --icon-opacity: 1;

  height: 40px;
  padding: 5px;
  display: flex;
  align-items: center;
  border-radius: 999px;
  outline: 2px solid transparent;
  border: 2px solid transparent;
  transition:
    all 150ms ease,
    background 150ms cubic-bezier(0, 3, 0, 2);
  background: rgb(236 229 216 / var(--bg-opacity));
  color: #4A5366;
  filter: drop-shadow(0 0 2px rgba(128, 128, 128, 0.4));
  font-size: 18px;
  &:hover {
    outline-color: #FFF;
    border-color: #DAD4CB;
  }
  &:active {
    filter: drop-shadow(0 0 6px rgba(128, 128, 128, 0.4));
    color: #FFF;
    --bg-opacity: 0.6;
    --icon-opacity: 0.8;
    outline-color: transparent;
  }
  &.dark {
    color: #ECE5D8;
    background: rgb(74 83 102 / var(--bg-opacity));
  }
  &.dark:hover {
    border-color: rgb(91 98 114 / var(--bg-opacity));
  }
  &.dark:active {
    filter: drop-shadow(0 0 2px #DAD4CB);
    color: #5B6272;
    --bg-opacity: 0.1;
    outline-color: #5B6272;
    border-color: transparent;
  }
}

.gs-button-icon {
  height: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 100%;
  background: #313131;
  opacity: var(--icon-opacity);
  position: relative;
  &::before {
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
}

.gs-button-content {
  flex: 1;
}
</style>
