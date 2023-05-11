<script lang="ts" setup>
import type { Ref } from 'vue'
import { liveQuery } from 'dexie'
import db from '@/database'
import { useFetchHook } from '@/hooks'
import { useArchiveStore } from '@/stores'

const archiveStore = useArchiveStore()

interface GroupedMarkers {
  [key: string]: {
    area: API.AreaVo
    markers: API.MarkerVo[]
  }
}

const isMarkerInstances = (v: (number[]) | (API.MarkerVo[])): v is API.MarkerVo[] => typeof v[0] !== 'number'

/** 为每个宝箱点位匹配其地区数据 */
const matchMarkerArea = async (markerParams: (number[]) | (API.MarkerVo[]), handleRef: Ref<GroupedMarkers>) => {
  /** 需要查询的物品 id */
  const queryItemIds = new Set<number>()

  const markers = isMarkerInstances(markerParams) ? markerParams : await db.marker.bulkGet(markerParams)
  markers.forEach((marker) => {
    const itemId = marker?.itemList?.[0]?.itemId
    itemId !== undefined && queryItemIds.add(itemId)
  })

  const treasureChestType = await db.itemType.where('name').equals('宝箱品质').first()
  if (!treasureChestType)
    return {}

  // 宝箱品质类型对应的物品
  const items = await db.item.where('typeIdList').equals(treasureChestType.id as number).toArray()
  const itemMap = items.reduce((seed, item) => {
    seed[item.id as number] = item
    return seed
  }, {} as Record<number, API.ItemVo>)

  const areas = await db.area.toArray()
  const areaMap = areas.reduce((seed, area) => {
    area !== undefined && (seed[area.id as number] = area)
    return seed
  }, {} as Record<string, API.AreaVo>)

  const res = markers.reduce((seed, marker) => {
    if (marker === undefined)
      return seed

    // 检查点位是否为宝箱类型
    const findItem = marker.itemList?.find(item => (item.itemId as number) in itemMap)
    if (!findItem)
      return seed

    const markerItem = itemMap[findItem.itemId as number]
    const markerArea = areaMap[markerItem.areaId as number]
    if (markerArea === undefined)
      return seed

    const parent = areaMap[markerArea.parentId as number]
    const areaParentCode = parent?.code
    if (areaParentCode === undefined)
      return seed

    if (!seed[areaParentCode]) {
      seed[areaParentCode] = {
        area: parent,
        markers: [],
      }
    }
    seed[areaParentCode].markers.push(marker)
    return seed
  }, {} as GroupedMarkers)

  handleRef.value = res
}

const rawMarkerGroup = ref<GroupedMarkers>({})
liveQuery(() => db.marker.toArray()).subscribe((markers) => {
  matchMarkerArea(markers, rawMarkerGroup)
})

const markersGroup = ref<GroupedMarkers>({})
const { refresh: analyse, loading } = useFetchHook({
  onRequest: () => matchMarkerArea([...archiveStore.currentArchive.body.Data_KYJG], markersGroup),
})

watch(() => archiveStore.currentArchive.body.Data_KYJG.size, analyse, { immediate: true })
</script>

<template>
  <div class="archive-analyser">
    <div v-if="loading">
      分析中...
    </div>

    <div v-else class="flex flex-col">
      <div>一级地区已标记的宝箱数</div>
      <div v-for="(area, code) in markersGroup" :key="code">
        {{ area.area.name }}: {{ area.markers.length }} / {{ rawMarkerGroup[code].markers.length }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.archive-analyser {
  height: 100%;
}
</style>
