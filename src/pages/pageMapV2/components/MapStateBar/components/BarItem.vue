<script setup lang="ts">
defineProps<{
  label?: string
  divider?: boolean
  interactive?: boolean
  actived?: boolean
}>()

const contextmenuVisible = ref(false)

const toggleContextmenuVisible = () => {
  contextmenuVisible.value = !contextmenuVisible.value
}

const contextmenuRef = ref<HTMLElement>()
onClickOutside(contextmenuRef, () => {
  contextmenuVisible.value = false
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="bar-item"
    :class="{
      divider,
    }"
  >
    <div
      class="fontend"
      :data-label="label"
      @contextmenu.prevent="toggleContextmenuVisible"
    >
      <slot name="default" />
    </div>

    <div
      v-if="$slots.contextmenu"
      ref="contextmenuRef"
      class="contextmenu"
      :class="{
        'is-collapse': !contextmenuVisible,
      }"
    >
      <slot name="contextmenu" />
    </div>
  </div>
</template>

<style scoped>
.bar-item {
  --divider-gap: 6px;

  position: relative;

  &.divider:not(:last-of-type) {
    margin-right: var(--divider-gap);
    &::before {
      content: '';
      position: absolute;
      height: 90%;
      width: var(--divider-gap);
      background: linear-gradient(
        90deg,
        transparent 0 calc(50% - 0.5px),
        #26324020 calc(50% - 0.5px) calc(50% + 0.5px),
        transparent calc(50% + 0.5px) 100%
      );
      right: calc(0px - var(--divider-gap));
      top: 0;
      translate: 0 5%;
      pointer-events: none;
    }
  }
}

.fontend {
  --mask-color: transparent;

  cursor: pointer;
  user-select: none;
  height: 32px;
  min-width: 32px;
  font-size: 12px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 2px;
    pointer-events: none;
    background-color: var(--mask-color);
    transition: all ease 150ms;
  }

  &:hover {
    --mask-color: #33333320;
  }

  &:active {
    --mask-color: #33333340;
  }
}

.contextmenu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);

  &.is-collapse {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
