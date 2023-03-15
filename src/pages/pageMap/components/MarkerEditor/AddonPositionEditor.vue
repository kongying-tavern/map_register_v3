<script lang="ts" setup>
import L from 'leaflet'
import { Location } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash'
import { useMap } from '@/pages/pageMap/hooks'

const props = defineProps<{
  modelValue?: string
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v?: string): void
}>()

const { map } = useMap()

const latlng = computed<[number, number]>({
  get: () => props.modelValue
    ?.split(',')
    .map(Number) as [number, number] ?? [0, 0],
  set: (pos) => {
    emits('update:modelValue', pos.join(','))
  },
})

const tempLatlng = ref(cloneDeep(latlng.value))
const startLatlng = ref(tempLatlng.value)

/** 进入拖拽编辑模式时用于隐藏弹窗的样式 */
const { load, unload } = useStyleTag(`
  .el-overlay.el-overlay {
    transition: opacity ease 150ms;
    opacity: 0;
    pointer-events: none;
  }
`, {
  immediate: false,
})

/** 临时用于拖拽操作的标记 */
const draggableMarker = L.marker([-9999, -9999], {
  draggable: true,
  pane: 'markerPane',
  zIndexOffset: 500,
  icon: L.divIcon({
    iconSize: [50, 50],
    className: 'genshin-draggable-marker',
  }),
})

/** 临时用于显示拖拽点与原始位置的连线 */
const line = L.polyline([], {
  pane: 'markerPane',
  interactive: true,
})

/** 用于渲染拖拽显示内容的 DOM */
const popupDOM = L.DomUtil.create('div')

draggableMarker.on('drag', (ev) => {
  if (!startLatlng.value || !map.value)
    return
  const { latlng: markerLatlng } = ev as L.LeafletEvent & { latlng: L.LatLng }
  map.value.popups.draggingPopup.setLatLng(markerLatlng)
  tempLatlng.value = [markerLatlng.lat, markerLatlng.lng]
  line.setLatLngs([startLatlng.value, markerLatlng])
})

// TODO: 在处理拖拽时采用了隐藏地图界面可操作 UI 的方式来避免 bug
// 需要进一步提高鲁棒性的做法
const openPositionEditPopup = () => {
  tempLatlng.value = cloneDeep(latlng.value)
  if (!props.modelValue || !map.value)
    return
  const { draggingPopup, markerPopup } = map.value.popups
  draggingPopup
    .close()
    .once('add', () => {
      if (!map.value)
        return
      line.remove().setLatLngs([]).addTo(map.value)
      draggableMarker.remove().setLatLng(tempLatlng.value).addTo(map.value)
      load()
    })
    .once('remove', () => {
      if (!map.value)
        return
      line.remove()
      draggableMarker.remove()
      unload()
      markerPopup.getLatLng() && markerPopup.openOn(map.value)
    })
    .setContent(popupDOM)
    .setLatLng(tempLatlng.value)
    .openOn(map.value)
}

const closePositionEditPopup = () => map.value?.popups.draggingPopup.close()

const emitPositionChange = () => {
  latlng.value = tempLatlng.value
  startLatlng.value = tempLatlng.value
  closePositionEditPopup()
}
</script>

<template>
  <div class="w-full flex justify-between items-center">
    <div>{{ latlng }}</div>
    <el-button circle title="编辑坐标" :icon="Location" @click="openPositionEditPopup" />
  </div>

  <Teleport :to="popupDOM">
    <div class="w-full flex flex-col gap-1">
      <pre>X: {{ tempLatlng[0].toFixed(2).padStart(12, ' ') }}</pre>
      <pre>Y: {{ tempLatlng[1].toFixed(2).padStart(12, ' ') }}</pre>
      <div>
        <el-button size="small" @click="closePositionEditPopup">
          取消
        </el-button>
        <el-button size="small" type="primary" @click="emitPositionChange">
          确认
        </el-button>
      </div>
    </div>
  </Teleport>
</template>
