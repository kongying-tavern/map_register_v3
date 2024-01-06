<script lang="ts" setup>
import { useMap, useMarkerFocus } from '@/pages/pageMapV2/hooks'
import { TRANSITION, mapSidermenuKey } from '@/pages/pageMapV2/shared'
import { useMapStateStore } from '@/stores'

const props = defineProps<{
  data: API.MarkerVo
}>()

const mapStateStore = useMapStateStore()
const { map } = useMap()
const { focusMarker, hoverMarker, out } = useMarkerFocus()

const mapSidermenuRef = inject(mapSidermenuKey, ref(null))

/**
 * @todo 需要添加视口转移的过渡效果
 */
const flyToMarker = async () => {
  if (!map.value || !mapSidermenuRef.value)
    return

  const { clientWidth: sw } = mapSidermenuRef.value

  const { width: cw, height: ch } = map.value

  const { updateViewState } = map.value
  const { render: { position: [x, y] } } = focusMarker(props.data)

  // 偏移视口中心使得点位位于可见区域水平中心、垂直 75% 的位置
  const viewOffsetX = cw / 2 - (sw + (cw - sw) / 2)
  const viewOffsetY = ch * -0.25

  const { zoom } = mapStateStore.viewState

  const scale = 2 ** zoom

  const positionOffsetX = cw <= sw ? 0 : scale * viewOffsetX
  const positionOffsetY = scale * viewOffsetY

  updateViewState({
    zoom: 0,
    target: [x + positionOffsetX, y + positionOffsetY],
    transitionDuration: 150,
    transitionEasing: TRANSITION.EASE_OUT,
  })
}
</script>

<template>
  <div
    :title="data.markerTitle"
    class="
      w-full
      overflow-hidden
      text-ellipsis
      whitespace-nowrap
      hover:underline
      underline-offset-4
      decoration-dashed
      text-[#E4DDD1]
      decoration-[#E4DDD1]
      cursor-pointer
    "
    @click="flyToMarker"
    @pointerover="() => hoverMarker(data)"
    @pointerout="out"
  >
    {{ data.markerTitle }}
  </div>
</template>
