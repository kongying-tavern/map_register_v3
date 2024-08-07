<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useMarkerFilter } from './hooks'
import { FilterTabPanel, FilterTabs } from './components'
import { CheckboxGroup, CheckboxItem, ConditionRow, ItemButton } from '.'
import { AppIconTagRenderer, GSButton } from '@/components'
import {
  useArchiveStore,
  useAreaStore,
  useIconTagStore,
  useItemStore,
  useItemTypeStore,
  useMapStateStore,
  useMarkerStore,
  usePreferenceStore,
} from '@/stores'
import { isItemVo } from '@/utils'
import { fallbackToStaticIcon } from '@/configs'

const archiveStore = useArchiveStore()
const iconTagStore = useIconTagStore()

const { areaCodeMap, parentAreaList, childrenAreaList } = storeToRefs(useAreaStore())
const { itemList, itemIdMap } = storeToRefs(useItemStore())
const { itemTypeList, itemTypeIdMap } = storeToRefs(useItemTypeStore())
const { markerBasicFilters } = storeToRefs(useMapStateStore())
const { preference } = storeToRefs(usePreferenceStore())
const { markerList } = storeToRefs(useMarkerStore())

// ==================== 其他 ====================
/** 筛选预设管理器 */
const { reviewCondition, deleteCondition, clearCondition } = useMarkerFilter()

const autoNextTab = () => {
  if (!preference.value['markerFilter.setting.autoNext'])
    return
  preference.value['markerFilter.state.step'] += 1
}

const archivedMarkers = computed(() => {
  const set = archiveStore.currentArchive.body.Data_KYJG
  return markerList.value.filter(marker => set.has(marker.id!))
})

// ==================== 地区 ====================
const selectedParentArea = computed(() => {
  if (!preference.value['markerFilter.state.parentAreaCode'])
    return
  return areaCodeMap.value.get(preference.value['markerFilter.state.parentAreaCode'])
})

const selectedChildrenAreaList = computed<API.AreaVo[]>(() => {
  if (!selectedParentArea.value)
    return []
  return childrenAreaList.value.filter(({ parentId }) => parentId === selectedParentArea.value?.id)
})

const selectedArea = computed(() => areaCodeMap.value.get(preference.value['markerFilter.state.areaCode'] ?? ''))

// ==================== 分类 ====================
const accessItemTypeList = computed<API.ItemTypeVo[]>(() => itemTypeList.value.filter(type => Boolean(type.isFinal)))

const selectedType = computed(() => {
  const itemTypeId = preference.value['markerFilter.state.itemTypeId']
  if (itemTypeId === undefined)
    return
  return itemTypeIdMap.value.get(itemTypeId)
})

// ==================== 物品 ====================

/** 当前地区可用的全部物品 */
const accessItemList = computed(() => {
  const area = selectedArea.value
  if (!area)
    return []
  return [...itemList.value]
    .filter(item => item.areaId === area.id)
})

/** 当前分类可用的全部物品 */
const visibleItemList = computed<API.ItemVo[]>(() => {
  const type = selectedType.value
  if (!type)
    return []
  return accessItemList.value
    .filter(({ typeIdList = [] }) => new Set(typeIdList).has(type.id!))
})

/** 当前分类可用的全部物品 id */
const visibleItemIds = computed(() => {
  const set = new Set<number>()
  accessItemList.value.forEach(({ id }) => {
    set.add(id!)
  })
  return set
})

/** 该项用于精细显示在当前分类下已选的物品数 */
const selectedItemCount = computed(() => {
  const selectedItemIds = preference.value['markerFilter.state.itemIds']
  if (!selectedItemIds?.length)
    return 0
  const currentTypeItemIds = new Set(visibleItemList.value.map(item => item.id!))
  return selectedItemIds.reduce((sum, cur) => {
    if (currentTypeItemIds.has(cur))
      sum += 1
    return sum
  }, 0)
})

// ==================== 分类计数 ====================

const calculateTypeCount = (markers: API.MarkerVo[]) => {
  return markers.reduce((map, marker) => {
    marker.itemList?.forEach(({ itemId }) => {
      if (!visibleItemIds.value.has(itemId!))
        return
      const item = itemIdMap.value.get(itemId!)
      if (!item)
        return
      item.typeIdList?.forEach((typeId) => {
        map.set(typeId, (map.get(typeId) ?? 0) + 1)
      })
    })
    return map
  }, new Map<number, number>())
}

const typeTotalMap = computed(() => calculateTypeCount(markerList.value))

const typeCountMap = computed(() => calculateTypeCount(archivedMarkers.value))

// ==================== 物品计数 ====================

const calculateItemCount = (markers: API.MarkerVo[]) => markers.reduce((map, marker: API.MarkerVo) => {
  marker.itemList?.forEach(({ itemId, count = 0 }) => {
    map.set(itemId!, (map.get(itemId!) ?? 0) + count)
  })
  return map
}, new Map<number, number>())

const itemTotalMap = computed(() => calculateItemCount(markerList.value))

const itemCountMap = computed(() => calculateItemCount(archivedMarkers.value))

// ==================== 打点物品 ====================
const dropzoneRef = ref<HTMLElement>()
const { isOverDropZone } = useDropZone(dropzoneRef)

const defaultMarkingItem = asyncComputed(() => {
  const id = preference.value['markerFilter.state.defaultMarkingItemId']
  if (id === undefined)
    return
  return itemIdMap.value.get(id)
})

const removeDefaultMarkingItem = () => {
  preference.value['markerFilter.state.defaultMarkingItemId'] = undefined
}

const handleDragItem = (ev: DragEvent) => {
  if (!ev.dataTransfer)
    return
  // 数据来源搜索 dataTransfer.setData
  const str = ev.dataTransfer.getData('text')
  if (!str)
    return
  const data = JSON.parse(str)
  if (!isItemVo(data))
    return
  ev.preventDefault()
  preference.value['markerFilter.state.defaultMarkingItemId'] = data.id!
}
</script>

<template>
  <FilterTabs v-model="preference['markerFilter.state.step']" class="flex-1" style="min-height: 350px; max-height: 500px">
    <FilterTabPanel label="地区" :content="selectedArea?.name ?? '--'" :value="0">
      <div class="h-full grid grid-cols-[1fr_auto_1fr]">
        <CheckboxGroup
          v-model="preference['markerFilter.state.parentAreaCode']"
          :options="parentAreaList"
          label-key="name"
          value-key="code"
        >
          <template #icon="{ row }">
            <AppIconTagRenderer
              :src="iconTagStore.tagSpriteUrl"
              :mapping="iconTagStore.tagCoordMap.get(row.iconTag ?? '')"
              class="w-full aspect-square"
            >
              <img :src="fallbackToStaticIcon(row)">
            </AppIconTagRenderer>
          </template>
        </CheckboxGroup>

        <div style="width: 1px; height: 100%; background: #E3DDD140;" />

        <CheckboxGroup
          v-model="preference['markerFilter.state.areaCode']"
          :options="selectedChildrenAreaList"
          label-key="name"
          value-key="code"
          @change="autoNextTab"
        >
          <template #icon="{ row }">
            <AppIconTagRenderer
              :src="iconTagStore.tagSpriteUrl"
              :mapping="iconTagStore.tagCoordMap.get(row.iconTag ?? '')"
              class="w-full aspect-square"
            >
              <img :src="fallbackToStaticIcon(row)">
            </AppIconTagRenderer>
          </template>
        </CheckboxGroup>
      </div>
    </FilterTabPanel>

    <FilterTabPanel label="类型" :content="selectedType?.name ?? '--'" :value="1">
      <CheckboxGroup
        v-model="preference['markerFilter.state.itemTypeId']"
        :options="accessItemTypeList"
        label-key="name"
        value-key="id"
        two-col
        @change="autoNextTab"
      >
        <template #icon="{ row }">
          <AppIconTagRenderer
            :src="iconTagStore.tagSpriteUrl"
            :mapping="iconTagStore.tagPositionMap[row.iconTag ?? '']"
            class="w-full aspect-square"
          />
        </template>
        <template #default="{ row, actived }">
          <ItemButton
            :finished-num="typeCountMap.get(row.id!)"
            :total-num="typeTotalMap.get(row.id!)"
            :name="row.name"
            :actived="actived"
          />
        </template>
      </CheckboxGroup>
    </FilterTabPanel>

    <FilterTabPanel label="物品" :content="selectedType ? `已选 ${selectedItemCount} 项` : '--'" :value="2">
      <CheckboxGroup
        v-model:multiple-value="preference['markerFilter.state.itemIds']"
        :options="visibleItemList"
        label-key="name"
        value-key="id"
        multiple
        show-select-all-btn
        two-col
        draggable
      >
        <template #icon="{ row }">
          <AppIconTagRenderer
            :src="iconTagStore.tagSpriteUrl"
            :mapping="iconTagStore.tagPositionMap[row.iconTag ?? '']"
            class="w-full aspect-square"
          />
        </template>
        <template #all="{ actived }">
          <ItemButton
            :finished-num="selectedType ? typeCountMap.get(selectedType.id!) : 0"
            :total-num="selectedType ? typeTotalMap.get(selectedType.id!) : 0"
            name="选择全部"
            :actived="actived"
          />
        </template>
        <template #default="{ row, actived }">
          <ItemButton
            :finished-num="itemCountMap.get(row.id!)"
            :total-num="itemTotalMap.get(row.id!)"
            :name="row.name"
            :actived="actived"
          />
        </template>
      </CheckboxGroup>
    </FilterTabPanel>
  </FilterTabs>

  <div class="text-white px-2 pt-1">
    默认打点物品
  </div>

  <div
    ref="dropzoneRef"
    class="marking-item"
    :class="{
      'over-drop': isOverDropZone,
      'checked': Boolean(defaultMarkingItem),
    }"
    @drop="handleDragItem"
  >
    <template v-if="!defaultMarkingItem">
      {{ isOverDropZone ? '放开以应用该物品' : '拖拽物品到此处' }}
    </template>

    <CheckboxItem v-else is-actived :label="defaultMarkingItem.name" style="margin: 0; width: 100%" @click="removeDefaultMarkingItem">
      <template #icon>
        <AppIconTagRenderer
          :src="iconTagStore.tagSpriteUrl"
          :mapping="iconTagStore.tagPositionMap[defaultMarkingItem.iconTag ?? '']"
          class="w-full aspect-square"
        />
      </template>
      <template #default>
        <div class="marking-item--content">
          <ItemButton
            :name="defaultMarkingItem.name"
            :finished-num="itemCountMap.get(defaultMarkingItem.id!)"
            :total-num="itemTotalMap.get(defaultMarkingItem.id!)"
            actived
          />
          <div class="grid px-2 place-items-center" style="background-color: var(--gs-color-danger);">
            <el-icon :size="20" color="#FFF">
              <DeleteFilled />
            </el-icon>
          </div>
        </div>
      </template>
    </CheckboxItem>
  </div>

  <div class="flex-shrink-0 flex items-center gap-2 text-white px-2 pt-1">
    条件列表
    <el-tooltip placement="top-start" effect="light" content="部分物品可能从属于多个分类，从而对应多个条件。">
      <el-icon :size="16">
        <QuestionFilled />
      </el-icon>
    </el-tooltip>
  </div>

  <div class="flex-shrink-0 flex-1 pt-2 pb-0 overflow-hidden">
    <el-scrollbar class="px-2" height="100%">
      <div class="h-full flex flex-col gap-2">
        <ConditionRow
          v-for="[id, condition] in markerBasicFilters"
          :key="id"
          :condition="condition"
          @review="() => reviewCondition(id)"
          @delete="() => deleteCondition(id)"
        />
      </div>
    </el-scrollbar>
  </div>

  <div class="condition-add-btn flex gap-2 justify-center p-2">
    <slot name="prepend" />
    <GSButton
      class="flex-1"
      size="small"
      :disabled="!markerBasicFilters.size"
      @click="clearCondition"
    >
      <template #icon>
        <el-icon color="var(--gs-color-danger)">
          <DeleteFilled />
        </el-icon>
      </template>
      清空条件
    </GSButton>
    <slot name="append" />
  </div>
</template>

<style scoped>
.marking-item {
  border: 2px dashed #C6C2BA;
  border-radius: 8px;
  margin: 8px;
  height: 48px;
  display: grid;
  place-items: center;
  color: #C6C2BA;

  &.over-drop {
    border-style: solid;
    border-color: #FFF;
  }

  &.checked {
    border-width: 0;
    place-items: flex-start;
  }
}

.marking-item--content {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
}
</style>
