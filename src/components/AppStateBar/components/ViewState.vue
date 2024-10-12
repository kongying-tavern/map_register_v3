<script setup lang="ts">
import BarItem from './BarItem.vue'
import { useMapStateStore, useTileStore } from '@/stores'
import { EaseoutInterpolator } from '@/pages/pageMapV2/core/interpolator'

const tileStore = useTileStore()
const mapStateStore = useMapStateStore()

const resetViewState = () => {
  mapStateStore.event.emit('setViewState', {
    target: [3568, 6969],
    zoom: 0,
    transitionDuration: 200,
    transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
  })
}

const markerView = computed(() => {
  const { target: [x, y], zoom } = mapStateStore.viewState
  const [mx, my] = tileStore.toMarkerCoordinate([x, y])
  return [mx, my, zoom]
})
</script>

<template>
  <BarItem label="视口信息" class="w-14 grid place-content-center" @click="resetViewState">
    <div class="w-16 text-xs translate-x-1.5 translate-y-[0.5px] leading-none overflow-hidden">
      <div class="flex gap-2 scale-[0.8] origin-left overflow-hidden -mb-[2px]">
        <div class="flex-shrink-0">
          X
        </div>
        <div class="flex-1 text-right overflow-hidden whitespace-nowrap text-ellipsis">
          {{ Math.floor(markerView[0]) }}
        </div>
      </div>
      <div class="flex gap-2 scale-[0.8] origin-left overflow-hidden">
        <div class="flex-shrink-0">
          Y
        </div>
        <div class="flex-1 text-right overflow-hidden whitespace-nowrap text-ellipsis">
          {{ Math.floor(markerView[1]) }}
        </div>
      </div>
      <div class="flex gap-2 scale-[0.8] origin-left overflow-hidden -mt-[2px]">
        <div class="flex-shrink-0">
          Z
        </div>
        <div class="flex-1 text-right overflow-hidden whitespace-nowrap text-ellipsis">
          {{ markerView[2].toFixed(2) }}
        </div>
      </div>
    </div>
  </BarItem>
</template>
