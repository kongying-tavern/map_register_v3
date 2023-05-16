<script lang="ts" setup>
import db from '@/database'
import { useArchiveStore } from '@/stores'
import { GSSwitch } from '@/components'

const archiveStore = useArchiveStore()

interface GroupedMarkers {
  [key: string]: {
    area: API.AreaVo
    parentArea: API.AreaVo
    normal: number
    restricted: number
    icon: string
  }
}

/** 临时图标 */
const _TEMP_ICON_MAP: Record<string, string> = {
  'C:MD': 'https://uploadstatic.mihoyo.com/contentweb/20200317/2020031714242066580.png',
  'C:LY': 'https://uploadstatic.mihoyo.com/contentweb/20200317/2020031714245390532.png',
  'C:DQ': 'https://uploadstatic.mihoyo.com/contentweb/20210719/2021071917401911066.png',
  'C:XM': 'https://webstatic.mihoyo.com/upload/contentweb/2022/08/15/f77d0c308b54728b6a1f3bc525e42955_6051524677514174999.png',
}
const TEMP_ICON_MAP = new Proxy(_TEMP_ICON_MAP, {
  get: (target, key, receiver) => {
    return Reflect.get(target, key, receiver) ?? Reflect.get(target, 'C:MD', receiver)
  },
})

/** 是否显示限定地区数据 */
const showRestrictedArea = ref(false)
const RESTRICTED_AREA_CODES = [
  'A:APPLE:1_6_STG1',
  'A:APPLE:1_6_STG2',
  'A:APPLE:2_8',
  'A:DQ:SANJIE',
]
const isRestrictedArea = (code?: string) => {
  if (!code)
    return false
  return RESTRICTED_AREA_CODES.findIndex(rcode => rcode === code) > -1
}

const isMarkerInstances = (v: (number[]) | (API.MarkerVo[])): v is API.MarkerVo[] => typeof v[0] !== 'number'

/** 为每个宝箱点位匹配其地区数据 */
const matchMarkerArea = async (markerParams: (number[]) | (API.MarkerVo[])) => {
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
        area: markerArea,
        parentArea: parent,
        icon: TEMP_ICON_MAP[areaParentCode as string],
        normal: 0,
        restricted: 0,
      }
    }
    const isRestrictedMarker = isRestrictedArea(markerArea.code)
    seed[areaParentCode][isRestrictedMarker ? 'restricted' : 'normal'] += 1
    return seed
  }, {} as GroupedMarkers)

  return res
}

const loading = ref(false)

const rawMarkersGroup = asyncComputed<GroupedMarkers>(async () => {
  const markers = await db.marker.toArray()
  return matchMarkerArea(markers)
}, {}, { evaluating: loading })

const markersGroup = asyncComputed<GroupedMarkers>(() => {
  return matchMarkerArea([...archiveStore.currentArchive.body.Data_KYJG])
}, {}, { evaluating: loading })

const getTotal = (groupItem?: GroupedMarkers[keyof GroupedMarkers]) => {
  if (!groupItem)
    return 0
  return showRestrictedArea.value
    ? groupItem.normal + groupItem.restricted
    : groupItem.normal
}
</script>

<template>
  <div class="w-full flex-1 flex flex-col overflow-hidden">
    <div class="w-full flex justify-between items-center text-lg p-2" style="color:#84603D;">
      宝箱收集进度
      ({{ archiveStore.currentArchive.slotIndex ? archiveStore.archiveSlots[archiveStore.currentArchive.slotIndex]?.name : '<未选取存档>' }})
      <GSSwitch
        v-model="showRestrictedArea"
        label="包含限定地区"
        label-position="left"
        label-inactive-color="#353D4F"
      />
    </div>

    <el-scrollbar class="flex-1">
      <div class="p-1">
        <template v-for="(item, code, index) in rawMarkersGroup" :key="code">
          <div
            v-if="showRestrictedArea || item.normal > 0"
            class="gs-archive-analyser-item"
            :style="{
              '--markers-ratio': `${100 * (getTotal(markersGroup[code]) / getTotal(item))}%`,
              '--anime-delay': `${index * 50}ms`,
            }"
          >
            <div class="gs-archive-area w-12 h-12 row-span-2 mr-1 rounded-sm" :style="{ '--icon': `url(${item.icon})` }" />
            <div class="flex justify-between items-center">
              <span class="text-base w-32">
                {{ item.parentArea.name }}
              </span>
              <span class="flex-1 text-right">
                {{ (100 * (getTotal(markersGroup[code]) / getTotal(item))).toFixed(0) }}%
              </span>
              <span class="text-sm w-28 text-right">
                ({{ getTotal(markersGroup[code]) }} / {{ getTotal(item) }})
              </span>
            </div>
            <div class="flex items-center">
              <div class="gs-archive-analyser-bar" />
            </div>
          </div>
        </template>
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
@property --percentage {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@keyframes item-anime-in {
  from { opacity: 0%; }
  to { opacity: 100%; }
}

.gs-archive-analyser-item {
  --percentage: 0%;
  --radius: 8px;
  --clip: inset(0 0% 0 0);
  --shadow-color: #CCCCCC80;

  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: repeat(2, 1fr);
  padding: 4px 8px;
  border: 2px solid #E0D6CB;
  border-radius: 6px;
  outline: 2px solid transparent;
  outline-offset: -2px;
  margin-bottom: 4px;
  position: relative;
  background: #F0E9DC;
  justify-content: space-between;
  opacity: 0;
  overflow: hidden;
  animation: item-anime-in 100ms linear forwards;
  animation-delay: calc(50ms + var(--anime-delay));
  transition: all ease 150ms;
  user-select: none;
  cursor: pointer;
  box-shadow: 0 0 4px var(--shadow-color);
  scale: 0.98 1;

  &:hover {
    --shadow-color: #AAAAAA80;
    scale: 1 1;
    background: #F4EEE1;
    outline-color: #D7CBBC;
  }
}

@keyframes percentage-bar-anime-in {
  from { --percentage: 0%; }
  to { --percentage: var(--markers-ratio); }
}

.gs-archive-area {
  // background: linear-gradient(135deg, #807AA4, #CF9CDC);
  background: #84603D;
  mask: var(--icon);
  mask-size: contain;
}

.gs-archive-analyser-bar {
  width: 100%;
  height: var(--radius);
  background: linear-gradient(to right, #F7BA3F var(--percentage), #e0dcd4 var(--percentage));
  border-radius: 8px;
  animation: percentage-bar-anime-in 300ms ease-out forwards;
  animation-delay: var(--anime-delay);
}
</style>
