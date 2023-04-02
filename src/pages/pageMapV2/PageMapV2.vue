<script lang="ts" setup>
import { GenshinMap } from './core'
import { LAYER_CONFIGS } from './config'
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
</script>

<template>
  <div class="w-full h-full relative">
    <canvas ref="canvasRef" class="w-full h-full bg-black" />

    <div class="absolute right-2 top-2 flex gap-2">
      <AppUserAvatar />
    </div>

    <div class="absolute left-2 bottom-2 flex flex-col gap-2">
      <router-link to="/map">
        <el-button>V1地图</el-button>
      </router-link>

      <el-switch v-model="showBorder" inline-prompt active-text="显示边框" inactive-text="隐藏边框" />

      <el-switch v-model="showTag" inline-prompt active-text="显示标签" inactive-text="隐藏标签" />

      <el-select v-model="baseLayerCode">
        <el-option
          v-for="config in LAYER_CONFIGS"
          :key="config.code"
          :label="config.name"
          :value="config.code"
        />
      </el-select>
    </div>
  </div>
</template>
