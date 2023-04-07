<script lang="ts" setup>
import { Filter, List, Setting } from '@element-plus/icons-vue'
import { LAYER_CONFIGS } from './config'
import { useMap } from './hooks'
import { CollapseButton, MarkerFilter, MarkerTable, SiderMenu, SiderMenuItem } from './components'
import { AppUserAvatar } from '@/components'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const { baseLayerCode, showBorder, showTag, showTooltip } = useMap(canvasRef)

const collapse = ref(true)
useEventListener('keypress', (ev) => {
  if (ev.code === 'Backquote')
    collapse.value = !collapse.value
})

const tabName = ref('filter')
</script>

<template>
  <div class="w-full h-full relative">
    <canvas ref="canvasRef" class="w-full h-full bg-black" />

    <div class="absolute top-2 left-2">
      <CollapseButton v-model:collapse="collapse" />
    </div>

    <SiderMenu v-model:collapse="collapse" v-model="tabName">
      <SiderMenuItem name="filter" label="筛选" :icon="Filter">
        <MarkerFilter />
      </SiderMenuItem>

      <SiderMenuItem name="marker-table" label="点位列表" :icon="List">
        <MarkerTable />
      </SiderMenuItem>

      <SiderMenuItem name="setting" label="设置" :icon="Setting">
        <div class="h-full flex flex-col gap-2 p-4">
          <el-select v-model="baseLayerCode">
            <el-option
              v-for="config in LAYER_CONFIGS"
              :key="config.code"
              :label="config.name"
              :value="config.code"
            />
          </el-select>
          <el-switch v-model="showBorder" inline-prompt active-text="显示边框" inactive-text="隐藏边框" />
          <el-switch v-model="showTag" inline-prompt active-text="显示标签" inactive-text="隐藏标签" />
          <el-switch v-model="showTooltip" inline-prompt active-text="显示坐标" inactive-text="隐藏坐标" />
          <AppUserAvatar />
        </div>
      </SiderMenuItem>
    </SiderMenu>
  </div>
</template>
