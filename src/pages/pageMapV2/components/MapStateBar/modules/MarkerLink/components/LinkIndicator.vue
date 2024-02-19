<script setup lang="ts">
import { MapAffix } from '@/pages/pageMapV2/components'
import type { GSMapState } from '@/stores/types/genshin-map-state'

const props = defineProps<{
  source: GSMapState.MarkerWithRenderConfig
  target: GSMapState.MarkerWithRenderConfig
}>()

const shape = computed(() => {
  const { 0: xs } = props.source.render.position
  const { 1: ys } = props.source.render.position
  const { 0: xt } = props.target.render.position
  const { 1: yt } = props.target.render.position

  const xmin = Math.min(xs, xt)
  const xmax = Math.max(xs, xt)
  const ymin = Math.min(ys, yt)
  const ymax = Math.max(ys, yt)

  const w = xmax - xmin
  const h = ymax - ymin

  return {
    x1: xs > xt ? w : 0,
    y1: ys > yt ? h : 0,
    x2: xs < xt ? w : 0,
    y2: ys < yt ? h : 0,
    w,
    h,
  }
})

const xmin = computed(() => {
  const { 0: x1 } = props.source.render.position
  const { 0: x2 } = props.target.render.position
  return Math.min(x1, x2)
})

const ymin = computed(() => {
  const { 1: y1 } = props.source.render.position
  const { 1: y2 } = props.target.render.position
  return Math.min(y1, y2)
})

const prefix = crypto.randomUUID()
</script>

<template>
  <MapAffix
    :pos="[xmin, ymin]"
    :z-index="0"
    no-covert-coord
    zoom-with-map
  >
    <template #default="{ scale }">
      <div
        class="link-indicator"
        :style="{
          '--w': shape.w,
          '--h': shape.h,
        }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 ${shape.w} ${shape.h}`">
          <defs>
            <linearGradient
              :id="`${prefix}-linear`"
              :x1="`${100 * shape.x1 / shape.w}%`"
              :y1="`${100 * shape.y1 / shape.h}%`"
              :x2="`${100 * shape.x2 / shape.w}%`"
              :y2="`${100 * shape.y2 / shape.h}%`"
            >
              <stop offset="0%" stop-color="#FFFF00" />
              <stop offset="100%" stop-color="#00FF00" />
            </linearGradient>
          </defs>
          <line
            :x1="shape.x1"
            :y1="shape.y1"
            :x2="shape.x2"
            :y2="shape.y2"
            :stroke-width="2 / scale"
            :stroke="`url(#${prefix}-linear)`"
            stroke-dasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur=".5s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>
    </template>
  </MapAffix>
</template>

<style scoped>
.link-indicator {
  width: calc(var(--w) * 1px);
  height: calc(var(--h) * 1px);
  color: #FFFF00;
}
</style>
