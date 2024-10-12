<script setup lang="ts">
import type { LayersList } from '@deck.gl/core'
import type { GenshinMapProps, GenshinMapViewState } from '../types'
import { useGenshinMap } from '../hooks'
import type { GenshinMap } from '../core'

const props = defineProps<{
  layers?: LayersList
  cursor?: string
  initialViewState?: GenshinMapViewState
  disableViewStateChange?: boolean
  getTooltip?: GenshinMapProps['getTooltip']
}>()

const emits = defineEmits<{
  load: [GenshinMap]
}>()

const canvasRef = shallowRef<HTMLCanvasElement>()

const { instanceRef } = useGenshinMap(canvasRef, {
  initialViewState: props.initialViewState,
  layers: props.layers,
  controller: {
    scrollZoom: {
      transitionDuration: 60,
    },
  },
  getCursor: ({ isDragging, isHovering }) => {
    if (props.cursor?.trim().length)
      return props.cursor
    if (isHovering)
      return 'pointer'
    if (isDragging)
      return 'grabbing'
    return 'inherit'
  },
  getTooltip: (info) => {
    return props.getTooltip?.(info) ?? null
  },
  onViewStateChange: (params) => {
    if (props.disableViewStateChange)
      return
    return params.viewState
  },
  onLoad: () => {
    if (!instanceRef.value)
      return
    emits('load', instanceRef.value)
  },
})

watch(() => props.layers, layers => instanceRef.value?.setProps({ layers }))
</script>

<template>
  <canvas ref="canvasRef" draggable="false" />
</template>
