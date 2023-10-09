<script lang="ts" setup>
import type { Observable } from 'rxjs'
import { filter, fromEvent as fromRawEvent, map, switchMap, takeUntil } from 'rxjs'
import { CloseBold, SemiSelect } from '@element-plus/icons-vue'
import { fromEvent, useSubscription } from '@vueuse/rxjs'
import { useMap } from '../hooks'

const { map: mapInstance } = useMap()

const zoom = computed({
  get: () => mapInstance.value ? mapInstance.value.mainViewState.zoom : 0,
  set: (v) => {
    if (!mapInstance.value)
      return
    mapInstance.value.updateViewState({
      zoom: v,
    })
  },
})

const minZoom = computed(() => mapInstance.value?.mainViewState.minZoom ?? 0)
const maxZoom = computed(() => mapInstance.value?.mainViewState.maxZoom ?? 0)
const range = computed(() => maxZoom.value - minZoom.value)

const percentage = computed({
  get: () => (zoom.value - minZoom.value) / range.value,
  set: (v) => { zoom.value = range.value * v + minZoom.value },
})

const sliderRef = ref<HTMLElement>() as Ref<HTMLElement>

const pointerup = fromRawEvent<PointerEvent>(window, 'pointerup')
const pointermove = fromRawEvent<PointerEvent>(window, 'pointermove')
const pointerdown = fromEvent(sliderRef, 'pointerdown') as Observable<PointerEvent>
useSubscription(pointerdown.pipe(
  switchMap(({ y: startY }) => {
    const startH = (1 - percentage.value) * 180
    return pointermove.pipe(
      takeUntil(pointerup),
      map(({ y: moveY }) => startH + moveY - startY),
    )
  }),
  filter(deltaY => deltaY <= 180 && deltaY >= 0),
).subscribe((deltaY) => {
  percentage.value = 1 - deltaY / 180
}))
</script>

<template>
  <div v-if="mapInstance" class="genshin-zoom-controller -translate-y-1/2 -translate-x-6 select-none" v-bind="$attrs">
    <div class="zoom-button cursor-pointer" @click="percentage = Math.min(1, percentage + 0.25)">
      <el-icon :size="12" color="#FFF7EB" class="rotate-45">
        <CloseBold />
      </el-icon>
    </div>

    <div class="zoom-track relative overflow-visible">
      <div
        ref="sliderRef"
        class="zoom-slider absolute bottom-0 left-0 cursor-pointer"
        :style="{ '--offset': percentage }"
      >
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="m 0 0 l 64 0 l 0 64 l -64 0 z m 9.37 9.37 q 22.63 22.63 0 45.26 q 22.63 -22.63 45.26 0 q -22.63 -22.63 0 -45.26 q -22.63 22.63 -45.26 0 z" />
        </svg>
      </div>
    </div>

    <div class="zoom-button cursor-pointer" @click="percentage = Math.max(0, percentage - 0.25)">
      <el-icon :size="12" color="#FFF7EB">
        <SemiSelect />
      </el-icon>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.genshin-zoom-controller {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.zoom-button {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  &::before {
    content: '';
    width: 16px;
    height: 16px;
    position: absolute;
    rotate: 45deg;
    border: 2px solid #FFF7EB;
    border-radius: 2px;
  }
}

.zoom-track {
  width: 12px;
  height: 200px;
  border: 1px solid #A8A29A;
  border-radius: 6px;
  background: #333333D0;
}

.zoom-slider {
  width: 18px;
  height: 18px;
  background: #333;
  translate: -4px calc(-180px * var(--offset));
  rotate: 45deg;
  border-radius: 2px;
  overflow: hidden;
  color: #EDE5DA;
  filter: drop-shadow(0 0 1px #EDE5DA);
}
</style>
