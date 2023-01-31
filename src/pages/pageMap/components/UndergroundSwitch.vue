<!-- eslint-disable quote-props -->
<script lang="ts" setup>
import L from 'leaflet'
import type { Ref } from 'vue'
import { mapInjection } from '../shared'
import type { GenshinTileLayer } from '../utils'
import { useMapStore } from '@/stores'

const props = defineProps<{
  activeLayer: GenshinTileLayer | null
}>()

const mapStore = useMapStore()
const map = inject(mapInjection, ref(null))

/** 须弥雨林地下图层 */
const sumeruForestLayer = L.imageOverlay(
  'https://v3.yuanshen.site/imgs/sumeru_undergroundmap_shade.png',
  [[-6299, -2190], [-838, 1906]],
  { opacity: 0.75 },
)

/** 大赤沙海基本地下图层 */
const sumeruDesertLayer = L.imageOverlay(
  'https://v3.yuanshen.site/imgs/固定底图.png',
  [[-7664, 542], [-3566, 4640]],
  { opacity: 0.75 },
)

/** 风蚀沙地地下图层字典 */
const sumeruDesert2Layers: Record<string, L.ImageOverlay> = {}
const sumeruDesert2LayersBounds: Record<string, [number, number][]> = {
  '五绿洲': [[-6171, -730], [-6171 + 643, -730 + 390]],
  '君王之殿1': [[-6310, 138], [-6310 + 442, 138 + 409]],
  '君王之殿2': [[-6089, 139], [-6089 + 222, 139 + 139]],
  '君王之殿3': [[-6368, 145], [-6368 + 435, 145 + 468]],
  '居尔城墟·赤王神殿1': [[-7341, 1174], [-7341 + 583, 1174 + 688]],
  '居尔城墟·赤王神殿2': [[-6886, 1577], [-6886 + 130, 1577 + 169]],
  '居尔城墟·赤王神殿3': [[-7317, 1237], [-7317 + 581, 1237 + 482]],
  '永恒绿洲': [[-6793, -125], [-6793 + 698, -125 + 689]],
  '沙虫隧道1': [[-5914, -61], [-5914 + 682, -61 + 814]],
  '沙虫隧道2': [[-5517, -19], [-5517 + 275, -19 + 506]],
  '沙虫隧道3': [[-5490, -25], [-5490 + 180, -25 + 290]],
  '生命之殿': [[-7612, 2], [-7612 + 643, 2 + 588]],
  '行宫花园': [[-7219, -785], [-7219 + 507, -785 + 522]],
  '赤王的水晶杯': [[-7043, -284], [-7043 + 769, -284 + 902]],
  '酣乐之殿1': [[-6972, -455], [-6972 + 270, -455 + 354]],
  '酣乐之殿2': [[-6882, -548], [-6882 + 505, -548 + 514]],
  '酣乐之殿3': [[-6997, -496], [-6997 + 347, -496 + 178]],
  '酣乐之殿4': [[-6904, -494], [-6904 + 285, -494 + 279]],
  '镇灵监牢及巨人峡谷': [[-7186, 502], [-7186 + 788, 502 + 510]],
}
const sumeruDesert2LayersName = [
  '五绿洲',
  '君王之殿1',
  '君王之殿2',
  '君王之殿3',
  '居尔城墟·赤王神殿1',
  '居尔城墟·赤王神殿2',
  '居尔城墟·赤王神殿3',
  '永恒绿洲',
  '沙虫隧道1',
  '沙虫隧道2',
  '沙虫隧道3',
  '生命之殿',
  '行宫花园',
  '赤王的水晶杯',
  '酣乐之殿1',
  '酣乐之殿2',
  '酣乐之殿3',
  '酣乐之殿4',
  '镇灵监牢及巨人峡谷',
]

// 备用，位置调试，开启时需将 overlay 的 interactive 设置为 true，且 zIndex 需大于点位图层 (>100)
// WASD 移动左上坐标
// 数字小键盘 移动右下坐标
// 分号、引号 缩放
// const controlLayer = ref(null) as Ref<L.ImageOverlay | null>
// useEventListener(window, 'keydown', (ev) => {
//   if (!controlLayer.value)
//     return
//   const oldBounds = controlLayer.value.getBounds()
//   const xmin = oldBounds.getSouth()
//   const ymin = oldBounds.getWest()
//   const xmax = oldBounds.getNorth()
//   const ymax = oldBounds.getEast()

//   if (ev.code === 'KeyW') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin - 10],
//       [xmax, ymax],
//     ))
//     return
//   }
//   if (ev.code === 'KeyS') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin + 10],
//       [xmax, ymax],
//     ))
//     return
//   }
//   if (ev.code === 'KeyA') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin - 10, ymin],
//       [xmax, ymax],
//     ))
//     return
//   }
//   if (ev.code === 'KeyD') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin + 10, ymin],
//       [xmax, ymax],
//     ))
//     return
//   }
//   if (ev.code === 'Numpad8') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin],
//       [xmax, ymax - 10],
//     ))
//     return
//   }
//   if (ev.code === 'Numpad2') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin],
//       [xmax, ymax + 10],
//     ))
//     return
//   }
//   if (ev.code === 'Numpad4') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin],
//       [xmax - 10, ymax],
//     ))
//     return
//   }
//   if (ev.code === 'Numpad6') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin],
//       [xmax + 10, ymax],
//     ))
//     return
//   }
//   if (ev.code === 'Semicolon') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin],
//       [xmax + 100, ymax + 100],
//     ))
//     return
//   }
//   if (ev.code === 'Quote') {
//     controlLayer.value.setBounds(L.latLngBounds(
//       [xmin, ymin],
//       [xmax - 100, ymax - 100],
//     ))
//     return
//   }
//   console.log([[xmin, ymin], [xmax, ymax]])
// })

for (const i in sumeruDesert2LayersName) {
  const name = sumeruDesert2LayersName[i]
  sumeruDesert2Layers[name] = L.imageOverlay(
    `https://assets.yuanshen.site/overlay/${name}-阴影.png`,
    L.latLngBounds(sumeruDesert2LayersBounds[name] ?? [[0, 0], [100, 100]]),
    { opacity: 0.75 },
  )
}

/** 用于记录已经设置为 overlay 的图层 */
const cacheOverlayLayer = shallowRef(null) as Ref<L.ImageOverlay | L.ImageOverlay[] | null>

const renderDesert2 = () => {
  /** 默认显示图层 */
  const init = ['五绿洲', '君王之殿1', '居尔城墟·赤王神殿1', '赤王的水晶杯', '酣乐之殿1', '镇灵监牢及巨人峡谷']
  cacheOverlayLayer.value = []
  for (const i in init) {
    const name = init[i]
    const overlayLayer = sumeruDesert2Layers[name]
    cacheOverlayLayer.value.push(overlayLayer)
    map.value?.addLayer(overlayLayer)
    props.activeLayer?.setOpacity(0.7)
  }
}

/** 根据已选择的地区 code 解析的地区信息 */
const areaObj = computed(() => {
  if (!mapStore.areaCode)
    return null
  const units = mapStore.areaCode.split(':')
  return {
    tag: units[1],
    zone: units[2],
  }
})

/** 地下模式状态 */
const isUnderGround = ref<boolean>(false)

watch<[{ tag: string; zone: string } | null, boolean]>(() => [areaObj.value, isUnderGround.value], ([newAreaObj, visible]) => {
  if (cacheOverlayLayer.value) {
    if ('length' in cacheOverlayLayer.value) {
      for (const i in cacheOverlayLayer.value)
        cacheOverlayLayer.value[i] && map.value?.removeLayer(cacheOverlayLayer.value[i])
    }
    else {
      cacheOverlayLayer.value && map.value?.removeLayer(cacheOverlayLayer.value)
    }
  }
  props.activeLayer?.setOpacity(1)
  if (!visible || !newAreaObj || newAreaObj.tag !== 'XM') {
    isUnderGround.value = false
    return
  }
  if (newAreaObj.zone === 'DESERT2') {
    renderDesert2()
    return
  }
  const overlayLayer = ({
    FOREST: sumeruForestLayer,
    DESERT: sumeruDesertLayer,
  })[newAreaObj.zone]
  if (overlayLayer) {
    cacheOverlayLayer.value = overlayLayer
    map.value?.addLayer(overlayLayer)
    props.activeLayer?.setOpacity(0.7)
  }
})

/** 地下模式切换按钮背景颜色 */
const underGroundBtnColor = computed(() => {
  return !isUnderGround.value ? 'var(--bg-color)' : 'var(--el-color-info)'
})
</script>

<template>
  <el-tooltip
    v-if="areaObj?.tag === 'XM'"
    class="box-item"
    effect="dark"
    :content="`须弥地下模式 ${!isUnderGround ? '关闭' : '开启'}`"
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
