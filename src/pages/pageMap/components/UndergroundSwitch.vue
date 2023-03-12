<script lang="ts" setup>
import L from 'leaflet'
import type { Ref } from 'vue'
import { mapInjection } from '../shared'
import type { GenshinTileLayer } from '../utils'
import { useMapStore } from '@/stores'
import { undergroundLayerConfigs } from '@/pages/pageMap/configs'

const props = defineProps<{
  activeLayer: GenshinTileLayer | null
}>()

const mapStore = useMapStore()
const map = inject(mapInjection, ref(null))

const imgLayerMap = Object.fromEntries(Object
  .entries(undergroundLayerConfigs)
  .map(([areaCode, configs = []]) => [
    areaCode,
    configs.map(({ url, bounds: [lat, lng] }) => L.imageOverlay(url, [[...lat], [...lng]])),
  ]),
)
const overlayers = computed(() => imgLayerMap[mapStore.areaCode ?? ''] ?? [])

/** 用于记录已经设置为 overlay 的图层 */
const cacheOverlayLayer = shallowRef([]) as Ref<L.ImageOverlay[]>

/** 地下模式状态 */
const isUnderGround = ref<boolean>(false)

// TODO 需要添加图层顺序控制器
watch(() => [mapStore.areaCode, isUnderGround.value], () => {
  cacheOverlayLayer.value.forEach(layer => map.value?.removeLayer(layer))
  props.activeLayer?.setOpacity(1)

  if (!isUnderGround.value || !overlayers.value.length) {
    isUnderGround.value = false
    return
  }

  overlayers.value.forEach(layer => map.value?.addLayer(layer))
  cacheOverlayLayer.value = overlayers.value
  props.activeLayer?.setOpacity(0.5)
})

/** 地下模式切换按钮背景颜色 */
const underGroundBtnColor = computed(() => {
  return !isUnderGround.value ? 'var(--bg-color)' : 'var(--el-color-info)'
})

// DEBUG: 图层调试用
// useImageOimport { useImageOverlayControl } from '@/pages/pageMap/hooks'
// erlayController(cacheOverlayLayer)
</script>

<template>
  <el-tooltip
    v-if="overlayers.length > 0"
    class="box-item"
    effect="dark"
    :content="`地下模式 ${!isUnderGround ? '关闭' : '开启'}`"
    placement="bottom"
  >
    <el-button
      size="large"
      v-bind="$attrs"
      :style="{ 'background-color': underGroundBtnColor, 'border-color': underGroundBtnColor }"
      circle
      @click="isUnderGround = !isUnderGround"
    >
      <svg t="1673867585560" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="879" width="20" height="20">
        <path d="M512.219429 579.291429c17.133714 0 33.846857-5.577143 54.418285-17.572572l335.579429-194.56c34.285714-20.150857 48-36.022857 48-59.593143 0-23.131429-13.714286-39.003429-48-59.136L566.637714 53.869714c-20.571429-12.013714-37.284571-17.590857-54.418285-17.590857-17.572571 0-33.865143 5.577143-54.436572 17.572572L122.221714 248.411429c-34.285714 20.150857-48 36.022857-48 59.154285 0 23.588571 13.714286 39.442286 48 59.574857l335.561143 194.56c20.571429 12.013714 36.864 17.590857 54.436572 17.590858z m0-74.569143c-6.016 0-12.013714-2.157714-18.870858-6.016L166.784 311.862857c-1.718857-0.859429-2.998857-2.139429-2.998857-4.297143 0-1.700571 1.28-2.998857 2.998857-3.84l326.582857-186.88c6.838857-3.84 12.836571-5.979429 18.834286-5.979428 6.016 0 12.013714 2.139429 18.870857 5.997714l326.144 186.843429c2.139429 0.859429 3.437714 2.157714 3.437714 3.858285 0 2.139429-1.298286 3.437714-3.437714 4.297143L531.072 498.706286c-6.857143 3.858286-12.854857 6.016-18.852571 6.016z m0 285.842285c15.414857 0 28.708571-7.277714 46.701714-17.993142L927.085714 555.282286c16.274286-9.856 23.149714-23.990857 23.149715-37.284572 0-17.554286-12.854857-32.146286-24.429715-37.705143L528.493714 709.577143c-5.997714 3.419429-11.574857 5.997714-16.274285 5.997714-4.717714 0-10.294857-2.56-16.292572-5.997714L98.633143 480.274286c-11.995429 5.577143-24.850286 20.150857-24.850286 37.723428 0 13.293714 7.716571 27.867429 23.588572 37.302857L465.481143 772.571429c17.993143 10.715429 30.848 17.993143 46.72 17.993142z m0 197.156572c15.414857 0 28.708571-7.296 46.701714-18.011429L927.085714 752.420571c15.853714-8.996571 23.149714-23.990857 23.149715-37.284571 0-17.554286-12.854857-31.707429-24.429715-37.705143L528.493714 907.136c-5.997714 3.437714-11.574857 5.997714-16.274285 5.997714-4.717714 0-10.294857-2.56-16.292572-5.997714L98.633143 677.430857c-11.995429 5.997714-24.850286 20.132571-24.850286 37.705143 0 13.293714 7.716571 28.288 23.588572 37.302857L465.481143 969.691429c17.993143 10.715429 30.848 18.011429 46.72 18.011428z" p-id="880" fill="#ffffff" />
      </svg>
    </el-button>
  </el-tooltip>
</template>
