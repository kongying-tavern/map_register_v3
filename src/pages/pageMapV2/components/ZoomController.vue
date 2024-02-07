<script lang="ts" setup>
import type { Observable } from 'rxjs'
import { fromEvent as fromRawEvent, map, switchMap, takeUntil } from 'rxjs'
import { CloseBold, SemiSelect } from '@element-plus/icons-vue'
import { fromEvent, useSubscription } from '@vueuse/rxjs'
import { useMapStateStore } from '@/stores'
import { EaseoutInterpolator } from '@/pages/pageMapV2/core/interpolator'

withDefaults(defineProps<{
  /** 点击按钮的缩放差，必须为大于 0 小于 1 的值 @default 0.25 */
  deltaZoom?: number
}>(), {
  deltaZoom: 0.25,
})

const mapStateStore = useMapStateStore()

const minZoom = computed(() => mapStateStore.viewState.minZoom)
const maxZoom = computed(() => mapStateStore.viewState.maxZoom)
const range = computed(() => maxZoom.value - minZoom.value)
const percentage = computed(() => (mapStateStore.viewState.zoom - minZoom.value) / range.value)

const zoomTo = (newPercentage: number, transition = false) => {
  const newZoom = range.value * newPercentage + minZoom.value
  mapStateStore.event.emit('setViewState', {
    zoom: newZoom,
    transitionDuration: transition ? 200 : 0,
    transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
  })
}

const sliderRef = ref<HTMLElement>() as Ref<HTMLElement>

const pointerup = fromRawEvent<PointerEvent>(window, 'pointerup')
const pointermove = fromRawEvent<PointerEvent>(window, 'pointermove')
const pointerdown = fromEvent(sliderRef, 'pointerdown') as Observable<PointerEvent>
useSubscription(pointerdown.pipe(
  switchMap(({ y: startY }) => {
    const startH = (1 - percentage.value) * 180
    return pointermove.pipe(
      map(({ y: moveY }) => {
        const deltaY = startH + moveY - startY
        if (deltaY > 180 || deltaY < 0)
          return
        zoomTo(1 - deltaY / 180)
      }),
      takeUntil(pointerup),
    )
  }),
).subscribe())
</script>

<template>
  <div class="genshin-zoom-controller -translate-y-1/2 -translate-x-6 select-none" v-bind="$attrs">
    <div class="zoom-button cursor-pointer" @click="() => zoomTo(Math.min(1, percentage + deltaZoom), true)">
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

    <div class="zoom-button cursor-pointer" @click="() => zoomTo(Math.max(0, percentage - deltaZoom), true)">
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
