<script setup lang="ts">
import BarItem from './BarItem.vue'
import { useMapStateStore } from '@/stores'

const mapStateStore = useMapStateStore()

const canvasRef = ref<HTMLCanvasElement>()

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')!

  const fontSize = 10

  ctx.font = `${fontSize + 2}px monospace`
  ctx.fillStyle = '#263240'

  const draw = () => {
    const { width, height } = canvas
    const { target: [x, y], zoom } = mapStateStore.viewState
    ctx.clearRect(0, 0, width, height)
    ctx.fillText(`X${x.toFixed(0).padStart(9, ' ')}`, 2, 1 * fontSize, width)
    ctx.fillText(`Y${y.toFixed(0).padStart(9, ' ')}`, 2, 2 * fontSize, width)
    ctx.fillText(`Z${zoom.toFixed(2).padStart(9, ' ')}`, 2, 3 * fontSize, width)
    requestAnimationFrame(draw)
  }
  draw()
})
</script>

<template>
  <BarItem label="视口信息">
    <canvas ref="canvasRef" width="64" height="32" />
  </BarItem>
</template>
