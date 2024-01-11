<script lang="ts" setup>
import { useMap, useMarkerFocus } from '@/pages/pageMapV2/hooks'
import { mapSidermenuKey } from '@/pages/pageMapV2/shared'
import { EaseoutInterpolator } from '@/pages/pageMapV2/core/interpolator'

const props = defineProps<{
  data: API.MarkerVo
}>()

const { map } = useMap()
const { focusMarker, hoverMarker, out } = useMarkerFocus()

const mapSidermenuRef = inject(mapSidermenuKey, ref(null))

/**
 * @todo 使点位和弹窗显示在视口内合适的位置
 */
const flyToMarker = async () => {
  if (!map.value || !mapSidermenuRef.value)
    return

  const { render: { position: [x, y] } } = focusMarker(props.data, 400)
  map.value.setProps({
    initialViewState: {
      target: [x, y],
      zoom: 0,
      transitionDuration: 500,
      transitionInterpolator: new EaseoutInterpolator(['target', 'zoom']),
    },
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
