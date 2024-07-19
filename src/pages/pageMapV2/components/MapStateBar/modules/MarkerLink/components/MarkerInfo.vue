<script setup lang="ts">
import { useAreaStore, useIconTagStore, useItemStore } from '@/stores'
import type { GSMapState } from '@/stores/types/genshin-map-state'
import { AppIconTagRenderer } from '@/components'

const props = withDefaults(defineProps<{
  marker?: GSMapState.MarkerWithRenderConfig
  placeholder?: string
  color?: string
}>(), {
  placeholder: '--N/A--',
  color: '#FFFF00',
})

const areaStore = useAreaStore()
const itemStore = useItemStore()
const iconTagStore = useIconTagStore()

const areas = computed(() => {
  if (!props.marker)
    return []
  const areaIds = new Set<number>()
  return props.marker.itemList?.reduce((seed, { itemId }) => {
    const item = itemStore.itemIdMap.get(itemId!)
    if (!item)
      return seed
    const area = areaStore.areaIdMap.get(item.areaId!)
    if (!area || areaIds.has(area.id!))
      return seed
    seed.push(area)
    areaIds.add(area.id!)
    return seed
  }, [] as API.AreaVo[]) ?? []
})
</script>

<template>
  <div
    class="marker-info flex-1 flex-shrink-0 overflow-hidden"
    :style="{
      '--color': color,
    }"
  >
    <div v-if="!marker" class="h-full grid place-items-center">
      <el-text>{{ placeholder }}</el-text>
    </div>

    <div v-else class="h-full flex items-center p-1 gap-1">
      <AppIconTagRenderer
        :mapping="iconTagStore.tagPositionMap[marker.render.mainIconTag]"
        :src="iconTagStore.tagSpriteUrl"
        class="w-10 h-10 bg-[var(--el-color-info-light-7)] p-0.5 rounded-full flex-shrink-0 border border-[var(--el-color-info)]"
      />

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="whitespace-nowrap overflow-hidden text-ellipsis">
          {{ marker.markerTitle }}
        </div>
        <div class="flex gap-1">
          <el-tag
            v-for="area in areas"
            :key="area.id"
            disable-transitions
          >
            {{ area.name }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marker-info {
  height: 60px;
  font-size: 14px;
  border: 2px solid color-mix(in srgb, var(--color), #00000020);
  border-radius: 4px;
}
</style>
