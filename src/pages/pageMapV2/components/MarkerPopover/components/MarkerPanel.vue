<script lang="ts" setup>
defineProps<{
  actived: boolean
}>()
</script>

<template>
  <div class="genshin-marker-popover genshin-text" :class="{ actived }" v-bind="$attrs">
    <div class="popover-content flex flex-col">
      <div class="popover-header flex justify-between items-center p-2 gap-1">
        <slot name="header" />
      </div>

      <div class="popover-body overflow-hidden flex flex-col">
        <slot name="picture" />

        <slot name="prepend" />

        <el-scrollbar max-height="256px" class="p-2">
          <slot name="content" />
        </el-scrollbar>

        <slot name="append" />

        <div class="flex justify-between p-2 pt-0 gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.genshin-marker-popover {
  --arrow-size: 16px;
  --arrow-offset-y: 32px;
  --card-bg-color: #D9D3C8;
  --card-radius: 8px;

  width: 288px;
  opacity: 0;
  position: absolute;
  transition: opacity 150ms ease;
  translate: -50% calc(-100% - var(--arrow-offset-y) - var(--arrow-size));

  &.actived {
    opacity: 1;
  }
}

.popover-content {
  width: 100%;
  filter: drop-shadow(0 0 8px #333);
  border-radius: var(--card-radius);
  background: var(--card-bg-color);

  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform-origin: 0 0;
    translate: 0 calc(0.3 * var(--arrow-size) - 1px);
    rotate: 45deg;
    width: var(--arrow-size);
    height: var(--arrow-size);
    background-color: var(--card-bg-color);
    filter: drop-shadow(0 0 4px #333333);
    clip-path: polygon(150% -50%, 150% 150%, -50% 150%);
  }
}

.popover-header {
  color: #D3BC8E;
  border-radius: var(--card-radius) var(--card-radius) 0 0;
  background-color: #3D4555;
}

.popover-body {
  color: #676D7A;
}
</style>
