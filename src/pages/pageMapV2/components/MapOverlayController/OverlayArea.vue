<script setup lang="ts">
import OverlayCount from './components/OverlayCount.vue'
import { GSSelect } from '@/components'
import { useAreaStore, useOverlayStore, usePreferenceStore } from '@/stores'
import type { OverlayChunk } from '@/stores'

const areaStore = useAreaStore()
const overlayStore = useOverlayStore()
const preferenceStore = usePreferenceStore()

const isTile = (item: {
  areaCodes: Set<string>
  chunks: OverlayChunk[]
  id: string
  name: string
}) => {
  return item.chunks[0]?.group.role === 'tile'
}

const overlayCountMap = computed(() => overlayStore.activedItems.reduce((map, item) => {
  if (isTile(item))
    return map
  for (const areaCode of item.areaCodes)
    map.set(areaCode, (map.get(areaCode) ?? 0) + 1)
  return map
}, new Map<string, number>()))

const overlayTotalMap = computed(() => overlayStore.items.reduce((map, item) => {
  if (isTile(item))
    return map
  for (const areaCode of item.areaCodes)
    map.set(areaCode, (map.get(areaCode) ?? 0) + 1)
  return map
}, new Map<string, number>()))

const parentOverlayCountMap = computed(() => overlayStore.activedItems.reduce((map, item) => {
  for (const areaCode of item.areaCodes) {
    const area = areaStore.areaCodeMap.get(areaCode)
    if (!area || isTile(item))
      return map
    const parentArea = areaStore.areaIdMap.get(area.parentId!)
    if (!parentArea)
      return map
    map.set(parentArea.code!, (map.get(parentArea.code!) ?? 0) + 1)
  }
  return map
}, new Map<string, number>()))

const parentOverlayTotalMap = computed(() => overlayStore.items.reduce((map, item) => {
  for (const areaCode of item.areaCodes) {
    const area = areaStore.areaCodeMap.get(areaCode)
    if (!area || isTile(item))
      return map
    const parentArea = areaStore.areaIdMap.get(area.parentId!)
    if (!parentArea)
      return map
    map.set(parentArea.code!, (map.get(parentArea.code!) ?? 0) + 1)
  }
  return map
}, new Map<string, number>()))

const childrenAreaList = computed(() => {
  const parentAreaCode = preferenceStore.preference['markerFilter.state.parentAreaCode']
  const parentArea = areaStore.areaCodeMap.get(parentAreaCode)
  if (!parentArea)
    return []
  return areaStore.childrenAreaList.filter((area) => {
    return area.parentId === parentArea.id
  })
})
</script>

<template>
  <div class="w-full flex flex-wrap gap-2 p-1 pb-2 border-[gray] border-b-[1px]">
    <div class="min-w-[200px] flex-1 flex flex-col">
      <div class="text-sm text-[#495366]">
        父级地区
      </div>
      <GSSelect
        v-model="preferenceStore.preference['markerFilter.state.parentAreaCode']"
        :options="areaStore.parentAreaList"
        label-key="name"
        value-key="code"
        class="flex-1 text-sm"
      >
        <template #label="{ label, option }">
          <div v-if="!option">
            --/--
          </div>
          <div
            v-else
            class="w-full overflow-hidden text-ellipsis whitespace-nowrap"
            :title="label"
          >
            {{ label }}
          </div>
        </template>

        <template #default="{ label, option }">
          <OverlayCount
            :current="parentOverlayCountMap.get(option.code!)"
            :total="parentOverlayTotalMap.get(option.code!)"
            :label="label"
          />
        </template>
      </GSSelect>
    </div>

    <div class="min-w-[200px] flex-1 flex flex-col">
      <div class="text-sm text-[#495366]">
        子级地区
      </div>
      <GSSelect
        v-model="preferenceStore.preference['markerFilter.state.areaCode']"
        :options="childrenAreaList"
        label-key="name"
        value-key="code"
        class="flex-1 text-sm"
      >
        <template #missed>
          请选择子地区
        </template>

        <template #label="{ label, option }">
          <div v-if="!option">
            --/--
          </div>
          <div
            v-else
            class="w-full overflow-hidden text-ellipsis whitespace-nowrap"
            :title="label"
          >
            {{ label }}
          </div>
        </template>

        <template #default="{ label, option }">
          <OverlayCount
            :current="overlayCountMap.get(option.code!)"
            :total="overlayTotalMap.get(option.code!)"
            :label="label"
          />
        </template>
      </GSSelect>
    </div>
  </div>
</template>

<style scoped>
.parent-area {
  border: 1px solid red;
  padding: 0 8px;
  flex-shrink: 0;
}
</style>
