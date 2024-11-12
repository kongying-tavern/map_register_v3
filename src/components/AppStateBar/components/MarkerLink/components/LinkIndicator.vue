<script setup lang="ts">
import { MapAffix } from '@/components'
import type { GSMarkerInfo } from '@/packages/map'

const props = defineProps<{
  hover?: GSMarkerInfo
  source?: GSMarkerInfo
  target?: GSMarkerInfo
}>()

/** 点位匹配尺寸 */
const markerSize = ref(40)

/** 图形基础尺寸 */
const size = ref(50)
const center = computed(() => ({
  x: size.value / 2,
  y: size.value / 2,
}))

const hoverPosition = computed(() => {
  if (!props.hover
    || (props.source && props.target)
    || props.hover.id === props.source?.id
    || props.hover.id === props.target?.id
  )
    return
  return props.hover.render.position
})

const selectedShape = computed(() => {
  if (!props.source || !props.target)
    return
  const [xa, ya] = props.source.render.position
  const [xb, yb] = props.target.render.position
  const length = Math.sqrt((xa - xb) ** 2 + (ya - yb) ** 2)
  const theta = 180 * Math.atan2(yb - ya, xb - xa) / Math.PI
  return {
    x: xa,
    y: ya,
    theta,
    length,
  }
})

const preSelectShape = computed(() => {
  if (!props.source || !props.hover || props.source.id === props.hover.id)
    return
  if (props.source && props.target)
    return
  const { 0: xa, 1: ya } = props.source.render.position
  const { 0: xb, 1: yb } = props.hover.render.position
  const xmin = Math.min(xa, xb)
  const ymin = Math.min(ya, yb)
  const xmax = Math.max(xa, xb)
  const ymax = Math.max(ya, yb)
  const width = xmax - xmin
  const height = ymax - ymin
  const theta = Math.atan2(yb - ya, xb - xa)
  return {
    xmin,
    ymin,
    xmax,
    ymax,
    width,
    height,
    x: xa,
    y: ya,
    theta,
  }
})
</script>

<template>
  <MapAffix v-if="preSelectShape" :pos="[preSelectShape.xmin, preSelectShape.ymin]" no-covert-coord zoom-with-map>
    <template #default>
      <div class="overflow-visible border border-red-600" :style="`width: ${preSelectShape.width}px; height: ${preSelectShape.height}px`">
        <svg
          viewBox="0 0 100 100"
          fill="transparent"
        >
          <rect x="0" y="0" width="100" height="100" stroke="red" stroke-width="2" />
        </svg>
      </div>
    </template>
  </MapAffix>

  <!-- <MapAffix :pos="hoverPosition" no-covert-coord>
    <template #default="{ zoom }">
      <div class="w-0 h-0 overflow-visible">
        <svg
          viewBox="0 0 100 100"
          fill="transparent"
          :width="size"
          :height="size"
          :transform-origin="`${center.x} ${center.y}`"
          :transform="`translate(-${center.x}, -${center.y + (markerSize / 2) * 2 ** Math.min(0, zoom + 2)}) scale(${2 ** Math.min(0, zoom + 2)})`"
        >
          <defs>
            <mask id="mask">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <path d="M 50 -20 L 120 50 L 50 120 L -20 50 Z" fill="black" />
            </mask>
          </defs>
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="16"
            stroke="yellow"
            stroke-width="6"
            mask="url(#mask)"
          />
        </svg>
      </div>
    </template>
  </MapAffix> -->

  <!-- <MapAffix :pos="source?.render.position" no-covert-coord>
    <template #default="{ zoom }">
      <div class="w-0 h-0 overflow-visible">
        <svg
          viewBox="0 0 100 100"
          fill="transparent"
          :width="size"
          :height="size"
          :transform-origin="`${size / 2} ${size / 2}`"
          :transform="`translate(-${center.x}, -${center.y}) scale(${2 ** Math.min(0, zoom + 2)})`"
        >
          <circle cx="50" cy="50" r="48" stroke="yellow" stroke-width="2">
            <animate attributeName="r" values="48;1;1;2" dur="0.15s" repeatCount="1" fill="freeze" />
          </circle>
        </svg>
      </div>
    </template>
  </MapAffix> -->

  <!-- <MapAffix :pos="target?.render.position" no-covert-coord>
    <template #default="{ zoom }">
      <div class="w-0 h-0 overflow-visible">
        <svg
          viewBox="0 0 100 100"
          fill="transparent"
          :width="size"
          :height="size"
          :transform-origin="`${size / 2} ${size / 2}`"
          :transform="`translate(-${center.x}, -${center.y}) scale(${2 ** Math.min(0, zoom + 2)})`"
        >
          <circle cx="50" cy="50" r="48" stroke="yellow" stroke-width="2">
            <animate attributeName="r" values="48;1;1;2" dur="0.15s" repeatCount="1" fill="freeze" />
          </circle>
        </svg>
      </div>
    </template>
  </MapAffix> -->
</template>

<style scoped>
@keyframes hover-ping {
  75% {
    transform: scale(2);
  }
  100% {
    opacity: 0;
  }
}
</style>
