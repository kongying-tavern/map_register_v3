<script setup lang="ts">
import { Check, Close } from '@element-plus/icons-vue'
import { useMultiSelect } from './hooks'
import { MapWindowTeleporter } from '@/pages/pageMapV2/components'

const { id, shape, width, height, finalizeMission, closeWindow } = useMultiSelect({
  windowName: '点位批量操作',
})
</script>

<template>
  <div class="marker-multiselect-controller absolute left-0 top-0 w-full h-full">
    <svg v-if="shape" :viewBox="`0 0 ${width} ${height}`" fill="transparent">
      <rect
        :x="shape.xmin"
        :y="shape.ymin"
        :width="shape.width"
        :height="shape.height"
        stroke="yellow"
        stroke-width="2"
      />
    </svg>

    <MapWindowTeleporter :id="id" @close="finalizeMission">
      <div class="h-full flex flex-col overflow-hidden">
        <div class="flex-1 grid place-items-center">
          开发中...
        </div>

        <div class="flex justify-end p-2">
          <el-button :icon="Check" disabled type="primary">
            确认
          </el-button>
          <el-button :icon="Close" @click="closeWindow">
            取消
          </el-button>
        </div>
      </div>
    </MapWindowTeleporter>
  </div>
</template>

<style scoped>
.marker-multiselect-controller {
  z-index: 1;
  pointer-events: none;
}
</style>
