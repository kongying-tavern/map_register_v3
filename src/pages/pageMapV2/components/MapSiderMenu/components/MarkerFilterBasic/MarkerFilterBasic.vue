<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useMarkerFilter } from './hooks'
import { CheckboxGroup, CheckboxItem, ConditionRow, FilterTabs, ItemButton } from '.'
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
import db from '@/database'
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

const archivedMarkers = asyncComputed(async () => {
  const archivedMarkerIds = [...archiveStore.currentArchive.body.Data_KYJG]
  const archivedMarkers: API.MarkerVo[] = []
  await db.marker.where('id').anyOf(archivedMarkerIds).each((marker) => {
    archivedMarkers.push(marker)
  })
  return archivedMarkers
}, [])

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
  return markers.reduce((seed, marker) => {
    marker.itemList?.forEach(({ itemId }) => {
      if (!visibleItemIds.value.has(itemId!))
        return
      const item = itemIdMap.value.get(itemId!)
      if (!item)
        return seed
      item.typeIdList?.forEach((typeId) => {
        seed[typeId] = (seed[typeId] ?? 0) + 1
      })
      return seed
    })
    return seed
  }, {} as Record<number, number>)
}

const typeTotalMap = computed(() => calculateTypeCount(markerList.value))

const typeCountMap = computed(() => calculateTypeCount(archivedMarkers.value))

// ==================== 物品计数 ====================

const calculateItemCount = (markers: API.MarkerVo[]) => {
  return markers.reduce((seed, marker: API.MarkerVo) => {
    marker.itemList?.forEach((item) => {
      seed[item.itemId!] = (seed[item.itemId!] ?? 0) + (item.count ?? 0)
    })
    return seed
  }, {} as Record<number, number>)
}

const itemTotalMap = computed(() => calculateItemCount(markerList.value))

const itemCountMap = computed(() => calculateItemCount(archivedMarkers.value))

// ==================== 打点物品 ====================
const dropzoneRef = ref<HTMLElement | null>(null)
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
  <FilterTabs v-model="preference['markerFilter.state.step']" :tab-names="['地区', '分类', '物品']">
    <template #key-0>
      {{ selectedArea?.name ?? '--' }}
    </template>
    <template #key-1>
      {{ selectedType?.name ?? '--' }}
    </template>
    <template #key-2>
      {{ selectedType ? `已选 ${selectedItemCount} 项` : '--' }}
    </template>
  </FilterTabs>

  <div class="flex-1 overflow-hidden" style="max-height: 400px;">
    <div v-if="preference['markerFilter.state.step'] === 0" class="h-full flex">
      <CheckboxGroup
        v-model="preference['markerFilter.state.parentAreaCode']"
        class="flex-1"
        :options="parentAreaList"
        label-key="name"
        value-key="code"
      >
        <template #icon="{ row }">
          <AppIconTagRenderer
            :src="iconTagStore.tagSpriteUrl"
            :mapping="iconTagStore.tagPositionMap[row.iconTag ?? '']"
            class="w-full aspect-square"
          >
            <img :src="fallbackToStaticIcon(row)">
          </AppIconTagRenderer>
        </template>
      </CheckboxGroup>
      <div style="width: 1px; height: 98%; background: #E3DDD140;" />
      <CheckboxGroup
        v-model="preference['markerFilter.state.areaCode']"
        class="flex-1"
        :options="selectedChildrenAreaList"
        label-key="name"
        value-key="code"
        @change="autoNextTab"
      >
        <template #icon="{ row }">
          <AppIconTagRenderer
            :src="iconTagStore.tagSpriteUrl"
            :mapping="iconTagStore.tagPositionMap[row.iconTag ?? '']"
            class="w-full aspect-square"
          >
            <img :src="fallbackToStaticIcon(row)">
          </AppIconTagRenderer>
        </template>
      </CheckboxGroup>
    </div>

    <CheckboxGroup
      v-else-if="preference['markerFilter.state.step'] === 1"
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
          :finished-num="typeCountMap[row.id!]"
          :total-num="typeTotalMap[row.id!]"
          :name="row.name"
          :actived="actived"
        />
      </template>
    </CheckboxGroup>

    <CheckboxGroup
      v-else-if="preference['markerFilter.state.step'] === 2"
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
      <template #default="{ row, actived }">
        <ItemButton
          :finished-num="itemCountMap[row.id!]"
          :total-num="itemTotalMap[row.id!]"
          :name="row.name"
          :actived="actived"
        />
      </template>
    </CheckboxGroup>
  </div>

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
            :finished-num="itemCountMap[defaultMarkingItem.id!]"
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

  <div class="flex items-center gap-2 text-white px-2 pt-1">
    条件列表
    <el-tooltip placement="top-start" effect="light" content="部分物品可能从属于多个分类，从而对应多个条件。">
      <el-icon :size="16">
        <QuestionFilled />
      </el-icon>
    </el-tooltip>
  </div>

  <div class="flex-1 pt-2 pb-0 overflow-hidden">
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
