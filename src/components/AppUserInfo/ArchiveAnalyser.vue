<script lang="ts" setup>
import db from '@/database'

/** 该组件为存档数据分析和可视化组件 */

const props = defineProps<{
  archiveBody: {
    Data_KYJG: Set<number>
    Time_KYJG: Record<number, string>
  }
}>()

interface MarkerWithArea extends API.MarkerVo {
  itemId: number
  country: string
}

/** 为每个点位匹配其地区数据 */
const matchMarkerArea = async (markerIds: number[]) => {
  /** 需要查询的物品 id */
  const queryItemIds = new Set<number>()

  const markers = ((await db.marker.bulkGet(markerIds)).filter(Boolean) as API.MarkerVo[]).map((marker) => {
    const itemId = marker.itemList?.[0]?.itemId ?? -1
    queryItemIds.add(itemId)
    return {
      ...marker,
      itemId: marker.itemList?.[0].itemId ?? -1,
      country: '',
    } as MarkerWithArea
  })

  /** 物品与地区映射表 */
  const itemAreaMap = (await db.item.bulkGet([...queryItemIds])).reduce((seed, item) => {
    item && (seed[item.id as number] = item.areaId as number)
    return seed
  }, {} as Record<number, number>)

  /** 地区 id 与国家代码映射表 */
  const countries = (await db.area.bulkGet([...new Set(Object.values(itemAreaMap))])).reduce((seed, area) => {
    seed[area?.id as number] = area?.code?.split(':')?.[1] ?? 'UNKNOWN'
    return seed
  }, {} as Record<number, string>)

  markers.forEach((marker) => {
    marker.country = countries[itemAreaMap[marker.itemId]]
  })
}

onMounted(() => matchMarkerArea([...props.archiveBody.Data_KYJG]))
</script>

<template>
  <div class="archive-analyser">
    存档数据
  </div>
</template>

<style lang="scss" scoped>
.archive-analyser {
  height: 100%;
}
</style>
