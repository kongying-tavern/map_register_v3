<script lang="ts" setup>
withDefaults(defineProps<{
  actived: boolean
  zoom?: number
}>(), {
  zoom: 0,
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="genshin-marker-popover font-['HYWenHei-85W']"
    :class="{ actived }"
    :style="{
      '--arrow-offset-y': `${32 * 2 ** (zoom > -2 ? 0 : (zoom + 2))}px`,
    }"
  >
    <div class="popover-content flex flex-col">
      <div class="popover-header relative flex justify-between items-center p-1">
        <slot name="header" />
      </div>

      <div class="popover-body overflow-hidden flex flex-col">
        <slot name="picture" />

        <slot name="prepend" />

        <el-scrollbar
          :height="160"
          class="text-sm"
          always
          style="
            --el-scrollbar-opacity: 0.6;
            --el-scrollbar-hover-opacity: 1;
            --el-scrollbar-bg-color: #4A5366;
            --el-scrollbar-hover-bg-color: #434343;
          "
        >
          <div class="p-1 px-2">
            <slot name="content" />
          </div>
        </el-scrollbar>

        <slot name="append" />

        <div class="flex justify-between p-1 gap-1">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.genshin-marker-popover {
  --arrow-size: 16px;
  --card-bg-color: #D9D3C8;
  --card-radius: 8px;

  width: 256px;
  opacity: 0;
  position: absolute;
  transition: opacity 150ms ease;
  translate: -50% calc(-100% - var(--arrow-offset-y) - var(--arrow-size));
  pointer-events: none;

  &.actived {
    opacity: 1;
    pointer-events: all;
  }
}

.popover-content {
  width: 100%;
  filter: drop-shadow(0 0 8px #333);
  border-radius: var(--card-radius) var(--card-radius) 0 0;

  &::before {
    content: '';
    pointer-events: none;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform-origin: 0 0;
    rotate: 45deg;
    translate: 0 calc(0.3 * var(--arrow-size) - 0.25px);
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
  z-index: 1;
}

.popover-body {
  color: #676D7A;
  background: var(--card-bg-color);
  border-radius: 0 0 calc(2.5 * var(--card-radius)) calc(2.5 * var(--card-radius));
}
</style>
