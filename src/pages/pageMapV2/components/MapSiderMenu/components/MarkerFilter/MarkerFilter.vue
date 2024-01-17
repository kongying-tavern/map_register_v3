<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useMarkerFilter } from './hooks'
import { CheckboxGroup, CheckboxItem, ConditionRow, FilterTabs, ItemButton, PresetManager } from '.'
import { AppIconTagRenderer, GSButton } from '@/components'
import { IconSetting } from '@/components/AppIcons'
import {
  useArchiveStore,
  useAreaStore,
  useIconTagStore,
  useItemStore,
  useItemTypeStore,
  useMarkerStore,
  usePreferenceStore,
  useUserInfoStore,
} from '@/stores'
import db from '@/database'
import { isItemVo } from '@/utils'
import { HiddenFlagEnum } from '@/shared'
import { fallbackToStaticIcon } from '@/configs'

const archiveStore = useArchiveStore()
const userInfoStore = useUserInfoStore()
const iconTagStore = useIconTagStore()

const { areaList, areaCodeMap } = storeToRefs(useAreaStore())
const { itemList, itemIdMap } = storeToRefs(useItemStore())
const { itemTypeIdMap } = storeToRefs(useItemTypeStore())
const { preference } = storeToRefs(usePreferenceStore())

// ==================== 其他 ====================
interface Sortable {
  sortIndex?: number
}
const sort = (a: Sortable, b: Sortable) => {
  const { sortIndex: ia = 0 } = a
  const { sortIndex: ib = 0 } = b
  return ib - ia
}

/** 筛选预设管理器 */
const conditionManagerVisible = ref(false)

const { conditions, reviewCondition, deleteCondition, clearCondition } = useMarkerFilter()

const autoNextTab = () => {
  if (!preference.value['markerFilter.setting.autoNext'])
    return
  preference.value['markerFilter.state.step'] += 1
}

// ==================== 地区 ====================
const accessAreaList = computed<API.AreaVo[]>(() => {
  const { isNeigui } = userInfoStore
  return areaList.value.filter(({ hiddenFlag }) => isNeigui
    ? hiddenFlag !== HiddenFlagEnum.HIDDEN
    : hiddenFlag === HiddenFlagEnum.SHOW,
  )
})

const parentAreaList = computed<API.AreaVo[]>(() => accessAreaList.value.filter(area => !area.isFinal))

const selectedParentArea = computed(() => {
  if (!preference.value['markerFilter.state.parentAreaCode'])
    return
  return areaCodeMap.value.get(preference.value['markerFilter.state.parentAreaCode'])
})

const childrenAreaList = computed<API.AreaVo[]>(() => {
  if (!selectedParentArea.value)
    return []
  return accessAreaList.value.filter(({ parentId }) => parentId === selectedParentArea.value?.id)
})

const selectedArea = computed(() => areaCodeMap.value.get(preference.value['markerFilter.state.areaCode'] ?? ''))

// ==================== 分类 ====================
const itemTypeList = asyncComputed<API.ItemTypeVo[]>(async () => {
  const res = await db.itemType.filter(type => Boolean(type.isFinal)).toArray()
  return res.sort(sort)
}, [])

const selectedType = computed(() => {
  const itemTypeId = preference.value['markerFilter.state.itemTypeId']
  if (itemTypeId === undefined)
    return
  return itemTypeIdMap.value.get(itemTypeId)
})

// ==================== 物品 ====================
const accessItemList = computed(() => {
  const { isNeigui } = userInfoStore
  return itemList.value.filter(({ hiddenFlag }) => isNeigui
    ? hiddenFlag !== HiddenFlagEnum.HIDDEN
    : hiddenFlag === HiddenFlagEnum.SHOW,
  )
})

const visibleItemList = computed<API.ItemVo[]>(() => {
  const area = selectedArea.value
  const type = selectedType.value
  if (!area || !type)
    return []
  return accessItemList.value
    .filter(item => item.areaId === area.id)
    .filter(({ typeIdList = [] }) => new Set(typeIdList).has(type.id!))
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

// ==================== 物品计数 ====================
const { markerList } = storeToRefs(useMarkerStore())

const countMarkerItems = (markers: (API.MarkerVo | undefined)[]) => markers.reduce((seed: { [itemId: number]: number }, marker?: API.MarkerVo) => {
  marker?.itemList?.forEach((item) => {
    seed[item.itemId!] = (seed[item.itemId!] ?? 0) + 1
  })
  return seed
}, {} as Record<number, number>)

const itemTotalMap = computed(() => countMarkerItems(markerList.value))

const itemCountMap = asyncComputed(async () => {
  const archivedMarkerIds = [...archiveStore.currentArchive.body.Data_KYJG]
  const archivedMarkers = await db.marker.bulkGet(archivedMarkerIds)
  return countMarkerItems(archivedMarkers)
}, {})

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
  <div class="marker-filter genshin-text h-full flex flex-col">
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
          :options="childrenAreaList"
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
        :options="itemTypeList"
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
          <ItemButton :item-count-map="itemCountMap" :item-total-map="itemTotalMap" :row="row" :actived="actived" />
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
            <ItemButton :item-count-map="itemCountMap" :item-total-map="itemTotalMap" :row="defaultMarkingItem" actived />
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

    <div class="flex-1 p-2 pb-0 overflow-hidden">
      <el-scrollbar height="100%">
        <div class="h-full flex flex-col gap-2">
          <ConditionRow
            v-for="[id, condition] in conditions"
            :key="id"
            :condition="condition"
            @review="() => reviewCondition(id)"
            @delete="() => deleteCondition(id)"
          />
        </div>
      </el-scrollbar>
    </div>

    <div class="condition-add-btn flex gap-2 justify-center p-2 pt-0">
      <GSButton
        class="flex-1"
        size="small"
        :disabled="!conditions.size"
        @click="clearCondition"
      >
        <template #icon>
          <el-icon color="var(--gs-color-danger)">
            <DeleteFilled />
          </el-icon>
        </template>
        清空条件
      </GSButton>
      <GSButton
        class="flex-1"
        size="small"
        @click="conditionManagerVisible = true"
      >
        <template #icon>
          <el-icon color="var(--gs-color-confirm)">
            <IconSetting />
          </el-icon>
        </template>
        管理预设
      </GSButton>
    </div>

    <PresetManager v-model="conditionManagerVisible" :conditions="conditions" />
  </div>
</template>

<style scoped>
.marker-filter {
  width: 350px;
  max-width: calc(100dvw - 72px);
}

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
