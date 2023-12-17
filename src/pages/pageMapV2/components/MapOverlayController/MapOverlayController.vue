<script lang="ts" setup>
import { RefreshLeft } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { OverlayGroup } from '.'
import { useAreaStore, useOverlayStore, usePreferenceStore } from '@/stores'
import { useTransitionState } from '@/hooks'
import { CloseFilled } from '@/components/GenshinUI/GSIcon'

const overlayStore = useOverlayStore()
const preferenceStore = usePreferenceStore()

const { areaCodeMap } = storeToRefs(useAreaStore())

/** 按地区分组的 overlay 控制组 */
const overlayControlGroupsListedInArea = computed(() => {
  return Object.entries(overlayStore.overlayControlGroups).reduce((seed, [_, overlayGroup]) => {
    const { areaCode } = overlayGroup
    const topAreaCode = areaCode.startsWith('A:') ? `C:${areaCode.split(':')[1]}` : areaCode
    if (!seed[topAreaCode])
      seed[topAreaCode] = []
    seed[topAreaCode].push(overlayGroup)
    return seed
  }, {} as Record<string, (typeof overlayStore.overlayControlGroups)[string][]>)
})

const collapse = ref(true)

const elementRef = ref<HTMLElement | null>(null)
const { isTransitioning } = useTransitionState(elementRef, 'clip-path')

const activedAreaCode = ref<string>('')
watch(overlayControlGroupsListedInArea, (groups) => {
  activedAreaCode.value = Object.keys(groups)[0]
}, { immediate: true })
</script>

<template>
  <div
    ref="elementRef"
    class="gs-overlay-controller relative pointer-events-auto select-none"
    :class="{
      'is-collapse': collapse,
      'is-transitioning': isTransitioning,
    }"
  >
    <div
      class="collapse-btn absolute bottom-0 right-0 rounded-[50%] grid place-items-center"
      :class="{
        'is-actived': preferenceStore.preference['map.state.showOverlay'],
      }"
      @click="collapse = false"
    />

    <div v-show="!isTransitioning && !collapse" class="w-full h-full overflow-hidden flex flex-col">
      <div class="p-2 flex items-center justify-between text-xl text-[#AE9F80]">
        <div class="flex-1 flex items-center gap-2">
          附加图层
          <el-icon
            class="cursor-pointer hover:brightness-90 active:brightness-50 transition-all"
            :size="24"
            title="重置图层置顶状态"
            @click="() => overlayStore.initTopOverlays(true)"
          >
            <RefreshLeft />
          </el-icon>
        </div>
        <el-icon
          class="cursor-pointer hover:brightness-90 active:brightness-50 transition-all"
          :size="24"
          @click="collapse = true"
        >
          <CloseFilled />
        </el-icon>
      </div>

      <div class="sidermenu flex-1 flex text-white overflow-hidden bg-[#2b3949]">
        <div class="flex flex-col">
          <div
            v-for="(_, areaCode) in overlayControlGroupsListedInArea"
            :key="areaCode"
            class="sidermenu-item"
            :class="{
              'is-actived': areaCode === activedAreaCode,
            }"
            @click="activedAreaCode = areaCode"
          >
            {{ areaCodeMap.get(areaCode)?.name }}
          </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden bg-[#1b242e]">
          <div v-if="!Object.keys(overlayControlGroupsListedInArea).length" class="w-full h-full grid place-items-center">
            当前地图没有可用的附加图层
          </div>
          <el-scrollbar v-else>
            <OverlayGroup
              v-for="overlayGroup in overlayControlGroupsListedInArea[activedAreaCode]"
              :key="overlayGroup.id"
              :data="overlayGroup"
            />
          </el-scrollbar>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gs-overlay-controller {
  --bg: #263240;
  --clip: inset(0 0 0 0 round 6px);
  --collapse-size: 64px;
  --collapse-btn-opacity: 0;
  --collapse-btn-pointer-events: none;
  --line-color: red;

  background-color: var(--bg);
  border-radius: 6px;
  width: 400px;
  max-width: calc(100dvw - 48px);
  height: 80dvh;
  clip-path: var(--clip);
  transition: all ease 300ms;

  &.is-collapse {
    --clip: inset(calc(100% - var(--collapse-size)) 0 0 calc(100% - var(--collapse-size)) round var(--collapse-size));
    --collapse-btn-opacity: 1;
    --line-color: gray;
    --collapse-btn-pointer-events: auto;
  }

  &.is-transitioning {
    --collapse-btn-opacity: 0;
  }
}

.collapse-btn {
  --btn-icon-offset: 0%;
  --btn-icon-color: gray;
  --radius: 4px;
  --x-scale: 0.6;
  --x-radius: calc(var(--x-scale) * var(--radius));
  --y-offset: calc(40% - var(--btn-icon-offset, 0%));
  --y-gap: 6%;

  width: var(--collapse-size);
  height: var(--collapse-size);
  outline: 2px solid var(--line-color);
  outline-offset: -6px;
  cursor: pointer;
  opacity: var(--collapse-btn-opacity);
  transition: all ease 150ms;
  pointer-events: var(--collapse-btn-pointer-events);

  &.is-actived {
    --line-color: #1CFFFF;
    --btn-icon-offset: -5%;
    --btn-icon-color: #1CFFFF;
  }

  &:hover {
    scale: 1.05;
    --line-color: #1CFFFF;
    --btn-icon-color: #1CFFFF;
  }

  &:active {
    scale: 1;
    filter: brightness(75%);
  }

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: calc((50% + var(--y-gap)) - var(--btn-icon-offset, 0%));
    width: 50%;
    height: 50%;
    background-color: color-mix(in srgb, var(--btn-icon-color) 50%, #282a2c);
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
    background-color: color-mix(in srgb, var(--btn-icon-color) 50%, #E6E6E6);
    transform: translate(-50%, -50%) scale(1, var(--x-scale)) rotateZ(45deg);
    border-radius: var(--x-radius) var(--radius) var(--x-radius) var(--radius);
    transition: all linear 66ms;
  }
}

.sidermenu-item {
  width: 80px;
  height: 40px;
  display: grid;
  place-items: center;
  transition: all ease 150ms;

  &.is-actived {
    background-color: #AE9F80;
    color: #2b3949;
  }

  &:not(.is-actived) {
    cursor: pointer;
  }

  &:not(.is-actived):hover {
    background-color: #FFFFFF20;
  }

  &:not(.is-actived):active {
    background-color: #00000020;
  }
}
</style>
