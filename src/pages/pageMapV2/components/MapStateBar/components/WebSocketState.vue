<script setup lang="ts">
import { MostlyCloudy } from '@element-plus/icons-vue'
import BarItem from './BarItem.vue'
import { useSocketStore } from '@/stores'
import { MapWindowTeleporter } from '@/pages/pageMapV2/components'

const socketStore = useSocketStore()

const colorMap = {
  [WebSocket.OPEN]: 'var(--el-color-success)',
  [WebSocket.CONNECTING]: 'var(--el-color-warning)',
  [WebSocket.CLOSING]: 'var(--el-color-warning)',
  [WebSocket.CLOSED]: 'var(--el-color-danger)',
}

const id = crypto.randomUUID()
</script>

<template>
  <BarItem label="Socket" divider>
    <div class="h-full grid place-items-center">
      <el-icon :size="20" :color="colorMap[socketStore.status]">
        <MostlyCloudy />
      </el-icon>
    </div>

    <MapWindowTeleporter :id="id">
      <div>
        {{ socketStore.status }}
      </div>
    </MapWindowTeleporter>
  </BarItem>
</template>
