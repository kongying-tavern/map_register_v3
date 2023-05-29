<script lang="ts" setup>
import { ClickOutside as vClickOutside } from 'element-plus'
import type { GSMessageProps } from '.'
import { GSMessageService } from '.'

const props = withDefaults(defineProps<GSMessageProps>(), {
  duration: 3000,
})

defineEmits<{
  close: []
}>()

const visible = ref(true)

const onClickOutside = () => {
  visible.value = false
}

const durationCloseTimer = window.setTimeout(() => {
  visible.value = false
}, props.duration > 1000 ? props.duration : 1000)

onBeforeUnmount(() => {
  window.clearTimeout(durationCloseTimer)
})

const onAnimationEnd = (ev: AnimationEvent) => {
  if (!ev.animationName.startsWith('message-anime-out'))
    return
  GSMessageService.close()
}
</script>

<template>
  <div
    v-click-outside="onClickOutside"
    class="gs-message"
    :class="{
      close: !visible,
    }"
    @animationend="onAnimationEnd"
  >
    {{ message }}
  </div>
</template>

<style lang="scss">
@keyframes gs-message-model-anime-in {
  from {
    background-color: transparent;
  }
  to {
    background-color: #00000080;
  }
}

@keyframes gs-message-model-anime-out {
  from {
    background-color: #00000080;
  }
  to {
    background-color: transparent;
  }
}

.gs-message-container {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  background-color: transparent;
  transition: all ease-out 150ms;
  z-index: 3000;
  pointer-events: none;
  &.actived {
    pointer-events: all;
    animation: gs-message-model-anime-in ease-out 150ms forwards;
  }
  &.closed {
    animation: gs-message-model-anime-out ease-out 150ms forwards;
  }
}
</style>

<style lang="scss" scoped>
@keyframes message-anime-in {
  from {
    scale: 0.95;
    opacity: 0;
  }
  to {
    scale: 1;
    opacity: 1;
  }
}

@keyframes message-anime-out {
  from {
    scale: 1;
    opacity: 1;
  }
  to {
    scale: 0.95;
    opacity: 0;
  }
}

.gs-message {
  font-size: 16px;
  width: fit-content;
  padding: 1em;
  max-width: calc(100% - 2em);
  max-height: calc(100% - 2em);
  background: #283040;
  color: #ECE5D8;
  outline: 2px solid #FFFFFF40;
  border-radius: 6px;
  animation: message-anime-in 100ms ease-out forwards;
  scale: 0.95;
  opacity: 0;

  &.close {
    animation: message-anime-out 100ms ease-out forwards;
  }
}
</style>
