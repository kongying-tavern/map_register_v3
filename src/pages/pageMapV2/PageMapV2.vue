<script lang="ts" setup>
import { Filter, Setting } from '@element-plus/icons-vue'
import { GenshinMap } from './core'
import { LAYER_CONFIGS } from './config'
import { CollapseButton, SiderMenu, SiderMenuItem } from './components'
import { Logger } from '@/utils'
import { AppUserAvatar } from '@/components'

const logger = new Logger('[MapV2]')

const canvasRef = ref<HTMLCanvasElement | null>(null)

const map = shallowRef<GenshinMap | null>(null)

const baseLayerCode = computed({
  get: () => map.value?.baseLayerCode,
  set: v => map.value && (map.value.setBaseLayer(v)),
})

const showBorder = computed({
  get: () => map.value?.showBorder ?? false,
  set: v => map.value && (map.value.showBorder = v),
})

const showTag = computed({
  get: () => map.value?.showTag ?? false,
  set: v => map.value && (map.value.showTag = v),
})

const initMap = async () => {
  if (!canvasRef.value)
    return

  map.value = new GenshinMap({
    canvas: canvasRef.value,
  })

  map.value.ready.then((readyMap) => {
    logger.info('map is ready', readyMap)
    baseLayerCode.value = LAYER_CONFIGS[0].code
  })
}
onMounted(initMap)

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
        点位筛选器
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
        </div>
      </SiderMenuItem>
    </SiderMenu>

    <div class="absolute top-2 right-2 flex gap-2">
      <AppUserAvatar />
    </div>
  </div>
</template>
