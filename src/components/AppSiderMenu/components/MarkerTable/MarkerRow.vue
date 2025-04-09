<script lang="ts" setup>
import type { GSMarkerInfo } from '@/packages/map'
import { AppIconTagRenderer } from '@/components'

const props = defineProps<{
  data: GSMarkerInfo
  isHover: boolean
  isFocus: boolean
  iconSrc?: string
  iconMapping?: [number, number]
}>()

const emits = defineEmits<{
  hover: [GSMarkerInfo | null]
  focus: [GSMarkerInfo]
}>()

const themeColor = computed(() => {
  const [_, zone] = props.data.render.area.code!.split(':')
  return `var(--gs-color-${zone.toLowerCase()})`
})
</script>

<template>
  <div
    class="marker-card font-['HYWenHei-85W']"
    :class="{
      'is-hover': isHover,
      'is-focus': isFocus,
    }"
    :style="{
      '--theme-color': themeColor,
    }"
    @click="() => emits('focus', data)"
    @pointerenter="() => emits('hover', data)"
    @pointerleave="() => emits('hover', null)"
  >
    <div class="card-wrapper">
      <div class="row-span-2 bg-[var(--icon-bg)] rounded transition-all">
        <AppIconTagRenderer class="w-full h-full" :src="iconSrc" :mapping="iconMapping" />
      </div>

      <div class="flex items-center gap-1 overflow-hidden">
        <div class="w-12 h-full grid place-items-center text-xs text-white bg-[var(--theme-color-dark)] rounded">
          {{ data.id }}
        </div>
        <div class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
          {{ data.markerTitle }}
        </div>
      </div>

      <div class="flex gap-1 text-white text-xs">
        <div v-if="data.render.isUnderground" class="info-tag">
          非地面
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marker-card {
  --icon-bg: #111;
  --bg: #F4EFE280;
  --border-color: gray;
  --border-width: 2px;
  --theme-color-dark: color-mix(in srgb, var(--theme-color) 100%, black 20%);

  height: 100%;
  overflow: hidden;
  padding: 4px 14px 4px 6px;
  font-size: 14px;

  &:hover, &.is-hover {
    --bg: #F4EFE2A0;
  }

  &:active {
    --bg: #F4EFE2F0;
  }

  &.is-focus {
    --bg: #F4EFE2F0;
    --border-color: #D6AD85;
    --icon-bg: color-mix(in srgb, var(--theme-color) 60%, black 40%);
  }
}

.card-wrapper {
  border: var(--border-width) solid var(--border-color);
  height: 100%;
  background: var(--bg);
  border-radius: 8px;
  padding: 2px;
  transition: all ease 100ms;
  display: grid;
  gap: 4px;
  grid-template-columns: 44px auto;
  grid-template-rows: repeat(2, 20px);
}

.info-tag {
  height: 100%;
  display: grid;
  place-items: center;
  background: #F4F1EB;
  border: 1px solid rgba(128, 128, 128, 0.6);
  color: #8E6C4E;
  border-radius: 4px;
  padding: 1px 6px;
}
</style>
