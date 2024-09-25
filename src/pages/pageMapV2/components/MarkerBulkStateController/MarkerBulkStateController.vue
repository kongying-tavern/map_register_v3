<script setup lang="ts">
import { MapMissionInfo } from '../MapMissionInfo'
import { useMapSelect } from './hooks'

const { isProcessing, shape, stroke, width, height } = useMapSelect()
</script>

<template>
  <div v-if="isProcessing" class="w-full h-full absolute left-0 top-0 pointer-events-none z-[1]">
    <svg v-if="shape" :viewBox="`0 0 ${width} ${height}`" fill="transparent">
      <rect
        :x="shape.xmin"
        :y="shape.ymin"
        :width="shape.width"
        :height="shape.height"
        :stroke="stroke"
        stroke-width="2"
      />
    </svg>

    <MapMissionInfo title="批量标记点位">
      <p>- 左键框选来<span class="text-[#00FFFD]">标记</span>点位</p>
      <p>- 右键框选来<span class="text-[yellow]">取消标记</span>点位。</p>
    </MapMissionInfo>
  </div>
</template>
