<script lang="ts" setup>
defineProps<{
  collapse?: boolean
}>()

defineEmits<{
  (e: 'update:collapse', v?: boolean): void
}>()
</script>

<template>
  <div class="control-panel absolute top-0 left-0 bottom-0 flex" :class="{ 'is-collapse': collapse }">
    <div class="control-panel-sidebar" :class="{ 'is-collapse': collapse }">
      <slot name="sidebar" :collapse="collapse" />
    </div>

    <div class="control-extra-panel" :class="{ 'is-collapse': collapse }">
      <slot name="default" :collapse="collapse" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel {
  &.is-collapse {
    pointer-events: none;
  }
}

.control-panel-sidebar {
  width: 80px;
  --border-width: 2.5;
  background: paint(map-sidebar);
  transition: all ease 150ms;
  opacity: 1;

  &.is-collapse {
    opacity: 0;
  }
}

.control-extra-panel {
  background: #ECE5D8;
  width: fit-content;
  box-shadow: 4px 0 4px rgb(128 128 128 / 0.2) inset;
  transition: all ease 100ms;
  opacity: 1;
  translate: 0 0;
  clip-path: inset(0 0 0 0);

  &.is-collapse {
    opacity: 0;
    translate: -100% 0;
    clip-path: inset(0 0 0 100%);
  }
}
</style>
