<script lang="ts" setup>
import { useMap, useMarkerFocus } from '@/pages/pageMapV2/hooks'
import { genshinMapCanvasKey } from '@/pages/pageMapV2/shared'

const props = defineProps<{
  data: API.MarkerVo
}>()

const { map } = useMap()
const { focusMarker, hoverMarker, out } = useMarkerFocus()

const mapCanvas = inject(genshinMapCanvasKey, ref(null))

/**
 * @todo 需要添加视口转移的过渡效果
 */
const flyToMarker = () => {
  if (!map.value || !mapCanvas.value)
    return
  const { width: cw, height: ch } = mapCanvas.value
  const { width: vw, height: vh } = map.value
  console.log('[跳转到点位]', { cw, ch, vw, vh })
  // const { updateViewState } = map.value
  // const { render } = focusMarker(props.data)
  // updateViewState({
  //   zoom: 0,
  //   target: render.position,
  // })
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
