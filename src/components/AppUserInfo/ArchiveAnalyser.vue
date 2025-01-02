<script lang="ts" setup>
import db from '@/database'
import { useArchiveStore } from '@/stores'
import { GSSwitch } from '@/components'
import { fallbackToStaticIcon } from '@/configs'

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

/** 是否显示限定地区数据 */
const showRestrictedArea = computed({
  get: () => archiveStore.currentArchive.body.Preference['userCenter.setting.showRestrictedArea'],
  set: (v) => {
    archiveStore.currentArchive.body.Preference['userCenter.setting.showRestrictedArea'] = v
  },
})

/**
 * 属于限定的地区
 * @todo 从硬编码改为从订阅数据拉取
 */
const RESTRICTED_AREA_CODES = [
  'A:APPLE:1_6',
  'A:APPLE:2_8',
  'A:DQ:SANJIE',
  'A:VELURIYAM:3_8',
  'A:SIMULANKA:4_8',
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
        icon: fallbackToStaticIcon(markerArea),
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
  <div class="w-[calc(100%_-_32px)] mx-4 flex-1 flex flex-col overflow-hidden">
    <div class="flex-shink-0 w-full flex justify-between items-center text-lg p-2" style="color:#84603D;">
      <span
        class="inline-block w-72 overflow-hidden text-ellipsis whitespace-nowrap"
        :title="archiveStore.currentArchive.slotIndex ? archiveStore.archiveSlots[archiveStore.currentArchive.slotIndex]?.name : ''"
      >
        宝箱收集进度({{ archiveStore.currentArchive.slotIndex ? archiveStore.archiveSlots[archiveStore.currentArchive.slotIndex]?.name : '<未选取存档>' }})
      </span>
      <GSSwitch
        v-model="showRestrictedArea"
        label="包含限定地区"
        label-position="left"
        label-inactive-color="#353D4F"
      />
    </div>

    <div class="flex-1 overflow-hidden">
      <el-scrollbar>
        <div class="gs-archive-analyser-container grid gap-2 grid-cols-2 grid-rows-4 m-1">
          <template v-for="(item, code, index) in rawMarkersGroup" :key="code">
            <div
              v-if="showRestrictedArea || item.normal > 0"
              class="gs-archive-analyser-item grid gap-x-1"
              :style="{
                '--markers-ratio': `${(100 * (getTotal(markersGroup[code]) / getTotal(item))).toFixed(2)}%`,
                '--anime-delay': `${index * 50}ms`,
              }"
            >
              <div class="gs-archive-area w-12 h-12 row-span-2 rounded-sm" :style="{ '--icon': `url(${item.icon})` }" />

              <div class="text-base overflow-hidden whitespace-nowrap text-ellipsis" :title="item.parentArea.name">
                {{ item.parentArea.name }}
              </div>

              <div class="text-sm text-right">
                {{ getTotal(markersGroup[code]) }} / {{ getTotal(item) }}
              </div>

              <div class="gs-archive-analyser-bar col-span-2 flex items-center justify-end text-xs">
                {{ (100 * (getTotal(markersGroup[code]) / getTotal(item))).toFixed(2) }} %
              </div>
            </div>
          </template>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style scoped>
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

  grid-template-columns: auto 1fr 1fr;
  padding: 4px 8px 4px 4px;
  border-radius: 6px;
  border: 2px solid #E0D6CB;
  outline: 2px solid transparent;
  position: relative;
  background: #F0E9DC;
  justify-content: space-between;
  opacity: 0;
  overflow: hidden;
  animation: item-anime-in 100ms linear forwards;
  animation-delay: calc(50ms + var(--anime-delay));
  user-select: none;
  box-shadow: 0 0 4px var(--shadow-color);
  cursor: pointer;
  transition: all ease 150ms, border-color linear 100ms, outline-color linear 100ms;

  &:hover {
    --shadow-color: #AAAAAA80;
    background: #F4EEE1;
    border-color: transparent;
    outline-color: #D7CBBC;
  }
}

.gs-archive-area {
  background: #84603D;
  mask: var(--icon);
  mask-size: contain;
}

.gs-archive-analyser-bar {
  --percentage: var(--markers-ratio);

  height: 16px;
  background: linear-gradient(to right, #F7BA3F var(--percentage), #e0dcd4 var(--percentage));
  border-radius: 4px;
  transition: --percentage ease 500ms;
  transition-delay: var(--anime-delay);
  position: relative;

  &::before {
    content: var(--percentage);
    color: red;
    border: 1px solid red;
    width: 40px;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
