<script lang="ts" setup>
import { useOverlayStore } from '@/stores'

const props = defineProps<{
  data: ReturnType<typeof useOverlayStore>['overlayUnitGroups'][string]
}>()

const overlayStore = useOverlayStore()

const isHidden = computed({
  get: () => overlayStore.hiddenOverlayGroups.has(props.data.groupId),
  set: v => overlayStore[v ? 'hideOverlayGroup' : 'showOverlayGroup'](props.data.groupId),
})

const units = computed(() => Object.entries(props.data.units).map(([unitId, label]) => ({ label, unitId })).sort((a, b) => a.label.localeCompare(b.label)))

const width = computed(() => {
  const { 0: xmin, 2: xmax } = props.data.bounds
  return `${xmax - xmin}px`
})

const height = computed(() => {
  const { 1: ymax, 3: ymin } = props.data.bounds
  return `${ymax - ymin}px`
})
</script>

<template>
  <div
    class="gs-overlay-controller genshin-text text-2xl select-none relative pointer-events-none rounded-[32px] transition-all"
    :class="{
      'is-hidden': isHidden,
    }"
  >
    <div
      class="controller-zone absolute whitespace-nowrap pointer-events-auto flex flex-col gap-2 origin-top-left"
      :class="{
        'is-hidden': isHidden,
      }"
    >
      <div
        class="hidden-controller w-fit p-2 px-3 flex items-center gap-2 cursor-pointer bg-[#272E39E0]"
        @click="isHidden = !isHidden"
      >
        <el-icon :size="24" color="currentColor">
          <Hide v-if="isHidden" />
          <View v-else />
        </el-icon>
        <span>{{ data.label ?? 'unknown' }}</span>
      </div>

      <div
        class="index-controller flex-col w-fit rounded-[32px] bg-[#272E39E0]"
      >
        <div
          v-for="unit in units"
          :key="unit.unitId"
          class="overlay-button pb-2 pl-2 pr-4 flex items-center gap-2 cursor-pointer first-of-type:pt-2 whitespace-nowrap transition-all"
          :class="{ 'is-active': overlayStore.topOverlayInGroup[data.groupId] === unit.unitId }"
          @click="() => overlayStore.moveToTop(unit.unitId, data.groupId)"
        >
          <div class="overlay-icon w-[2em] h-[2em] rounded-[50%] relative transition-all" />
          {{ unit.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-overlay-controller {
  --switch-color: #49E8FF;
  --icon-size: 50px;
  --reverse-scale: calc(1 / var(--sc));
  --index-display: none;

  width: v-bind(width);
  height: v-bind(height);
  border: 2px dashed var(--switch-color);

  &:hover {
    border-style: solid;
  }

  &.is-hidden {
    --switch-color: gray;
    // TODO 非激活状态的透明度，后期抽离至用户设置
    opacity: 0.5;
  }
}

.controller-zone {
  // TODO 控制器的位置，后期抽离至用户设置
  right: 0;
  translate: calc(100% + 0.5 * var(--icon-size)) 0;
  scale: clamp(0.5, var(--reverse-scale), 1);
  content-visibility: auto;

  &:not(.is-hidden):hover {
    --index-display: flex;
  }
}

.hidden-controller {
  height: var(--icon-size);
  border: 2px solid var(--switch-color);
  color: var(--switch-color);
  border-radius: var(--icon-size);
}

.index-controller {
  display: var(--index-display);
}

.overlay-button {
  --btn-border-color: #FFFFFF40;
  --btn-icon-scale: 0.8;
  --btn-color: #FFF;
  --btn-icon-offset: 0%;

  color: var(--btn-color);

  &:hover {
    --btn-icon-scale: 1;
    --btn-border-color: #49E8FF;
    --btn-color: #DDD;
  }

  &:active {
    --btn-icon-scale: 0.9;
    --btn-border-color: #49E8FF60;
    --btn-color: #EEE;
  }

  &.is-active {
    --btn-icon-scale: 1;
    --btn-border-color: transparent;
    --btn-color: #49E8FF;
    --btn-icon-offset: -5%;
  }
}

.overlay-icon {
  --radius: 4px;
  --x-scale: 0.6;
  --x-radius: calc(var(--x-scale) * var(--radius));
  --y-offset: calc(40% - var(--btn-icon-offset, 0%));
  --y-gap: 6%;

  border: 3px solid var(--btn-border-color);
  scale: var(--btn-icon-scale);
  filter: drop-shadow(0 0 2px color-mix(in srgb, transparent 50%, var(--btn-color)));

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% + var(--y-gap)) - var(--btn-icon-offset, 0%));
    width: 50%;
    height: 50%;
    background-color: color-mix(in srgb, var(--btn-color) 50%, #282a2c);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all linear 66ms;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% - var(--y-gap)) + var(--btn-icon-offset, 0%));
    width: 50%;
    height: 50%;
    background-color: color-mix(in srgb, var(--btn-color) 50%, #E6E6E6);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all linear 66ms;
  }
}
</style>
