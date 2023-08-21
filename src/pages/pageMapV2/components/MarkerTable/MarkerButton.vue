<script lang="ts" setup>
import { useMap, useMarkerFocus } from '../../hooks'
import { GSButton } from '@/components'
import { useMapStore } from '@/stores'

const props = defineProps<{
  data: API.MarkerVo
}>()

const { map } = useMap()
const { focusMarker } = useMarkerFocus()
const mapStore = useMapStore()

/**
 * @todo 需要添加视口转移的过渡效果
 */
const flyToMarker = () => {
  if (!map.value)
    return
  const [x, y] = props.data.position!.split(',').map(Number)
  map.value.updateViewState({
    zoom: 0,
    target: map.value.projectCoord([x, y]),
  })
  focusMarker(props.data)
}

/**
 * 鼠标指向引导按钮时同时为地图上的点位添加 active 效果以突出显示
 * @todo 点位数量较多时可能会导致注册过多的事件监听器，需要修改为事件委托方式
 */
const hoverMarker = () => {
  mapStore.hover = props.data
}

/**
 * 鼠标离开引导按钮时同时为地图上的点位取消 active 效果
 * @todo 点位数量较多时可能会导致注册过多的事件监听器，需要修改为事件委托方式
 */
const unhoverMarker = () => {
  mapStore.hover = null
}
</script>

<template>
  <GSButton
    class="flex-0"
    size="small"
    :title="data.markerTitle"
    @click="flyToMarker"
    @pointerover="hoverMarker"
    @pointerout="unhoverMarker"
  >
    {{ data.markerTitle }}
  </GSButton>
</template>
