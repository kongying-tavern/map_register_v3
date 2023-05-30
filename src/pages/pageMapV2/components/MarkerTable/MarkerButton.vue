<script lang="ts" setup>
import { useMap, useMarkerDrawer } from '../../hooks'
import { useIconTagStore } from '@/stores'
import { GSButton } from '@/components'
import { FALLBACK_ITEM_ICON_URL } from '@/shared'

const props = defineProps<{
  data: API.MarkerVo
}>()

const { map } = useMap()
const { focusMarker } = useMarkerDrawer()
const iconStore = useIconTagStore()

/**
 * @todo 需要添加视口转移的过渡效果
 */
const flyToMarker = () => {
  if (!map.value || !map.value.baseLayer)
    return
  const [ox, oy] = map.value.baseLayer.rawProps.coordinateOrigin
  const [x, y] = props.data.position!.split(',').map(Number)
  map.value.updateViewState({
    target: [x + ox, y + oy],
  })
  focusMarker(props.data)
}
</script>

<template>
  <GSButton class="flex-1" size="small" :title="data.markerTitle" @click="flyToMarker">
    <template #icon>
      <img
        :src="iconStore.iconTagMap[data.itemList?.[0].iconTag ?? '']?.url || FALLBACK_ITEM_ICON_URL"
      >
    </template>
    {{ data.markerTitle }}
  </GSButton>
</template>
