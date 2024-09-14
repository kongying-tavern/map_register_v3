<script setup lang="ts">
import dayjs from 'dayjs'
import { AppIconTagRenderer } from '@/components'
import { useMarkerFocus } from '@/pages/pageMapV2/hooks'
import { useIconTagStore, useItemStore } from '@/stores'
import { pickMainItem } from '@/utils'

const props = defineProps<{
  data: Socket.DataEventRecord<'MarkerAdded'>
  preData?: Socket.DataEventRecord<'MarkerAdded'>
}>()

const itemStore = useItemStore()
const iconTagStore = useIconTagStore()

const { focusMarker } = useMarkerFocus()

const markerInfo = computed(() => {
  const [markerInfo] = props.data.args
  return markerInfo
})

const iconTag = computed(() => {
  const { mainIconTag } = pickMainItem(markerInfo.value, itemStore.itemIdMap)
  return mainIconTag
})
</script>

<template>
  <div
    class="
    p-2 rounded-lg
    select-none
    "
  >
    <div class="text-[var(--el-text-color-secondary)] mb-1">
      编辑点位
    </div>

    <div
      class="
      flex items-center gap-2 p-1 px-2 pr-4 rounded
      cursor-pointer
      border-l-[2px] border-[var(--el-color-warning)]
      bg-[var(--el-color-warning-light-9)]
      hover:bg-[var(--el-color-warning-light-7)]
      active:bg-[var(--el-color-warning-light-9)]
      "
      @click="() => focusMarker(markerInfo, { flyToMarker: true })"
    >
      <AppIconTagRenderer
        :src="iconTagStore.tagSpriteUrl"
        :mapping="iconTagStore.tagCoordMap.get(iconTag)"
        class="w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--el-text-color-primary)_10%,transparent_90%)]"
      />
      <div>
        <div class="font-bold">
          {{ markerInfo.markerTitle }}
        </div>
        <div>{{ `ID: ${markerInfo.id}` }}</div>
      </div>
    </div>

    <div class="text-[var(--el-text-color-secondary)] mt-1">
      {{ dayjs(data.time).format('YYYY-MM-DD HH:mm:ss') }}
    </div>
  </div>
</template>
