<script lang="ts" setup>
import { useMap, useMarkerFocus } from '../../hooks'
import { GSButton } from '@/components'

const props = defineProps<{
  data: API.MarkerVo
}>()

const { map } = useMap()
const { focusMarker, hoverMarker, out } = useMarkerFocus()

/**
 * @todo 需要添加视口转移的过渡效果
 */
const flyToMarker = () => {
  if (!map.value)
    return
  const { updateViewState } = map.value
  const { render } = focusMarker(props.data)
  updateViewState({
    zoom: 0,
    target: render.position,
  })
}
</script>

<template>
  <GSButton
    class="flex-0"
    size="small"
    :title="data.markerTitle"
    @click="flyToMarker"
    @pointerover="() => hoverMarker(data)"
    @pointerout="out"
  >
    {{ data.markerTitle }}
  </GSButton>
</template>
