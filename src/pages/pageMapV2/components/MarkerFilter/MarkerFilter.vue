<script lang="ts" setup>
import { DeleteFilled } from '@element-plus/icons-vue'
import { CheckboxGroup, CheckboxImage, CheckboxItem, ConditionManager, ConditionRow, FilterTabs, ItemButton } from '.'
import { GSButton, GSDivider } from '@/components'
import { IconSetting } from '@/components/AppIcons'
import { useArchiveStore, useIconTagStore, useMapStore, useUserStore } from '@/stores'
import { useCondition } from '@/pages/pageMapV2/hooks'
import db from '@/database'
import { isItemVo } from '@/utils'

// ==================== 其他 ====================
interface Sortable {
  sortIndex?: number
}
const sort = (a: Sortable, b: Sortable) => {
  const { sortIndex: ia = 0 } = a
  const { sortIndex: ib = 0 } = b
  return ib - ia
}

const userStore = useUserStore()
const archiveStore = useArchiveStore()

/** 条件管理器 */
const conditionManager = useCondition()
const conditionManagerVisible = ref(false)

watch(() => userStore.preference.id, () => {
  conditionManager.loadState('temp')
}, { immediate: true })

// ==================== 图标 ====================
const iconTagStore = useIconTagStore()

// ==================== 地区 ====================
const parentAreaList = asyncComputed<API.AreaVo[]>(() => db.area.filter(area => !area.isFinal).toArray(), [])

const childrenAreaList = asyncComputed<API.AreaVo[]>(() => {
  if (!conditionManager.parentAreaCode)
    return []
  const parentArea = parentAreaList.value.find(area => area.code === conditionManager.parentAreaCode) as API.AreaVo
  return db.area.where('parentId').equals(parentArea.id as number).toArray()
}, [])

// ==================== 分类 ====================
const itemTypeList = asyncComputed<API.ItemTypeVo[]>(async () => {
  const res = await db.itemType.filter(type => Boolean(type.isFinal)).toArray()
  return res.sort(sort)
}, [])

// ==================== 物品 ====================
const itemList = asyncComputed<API.ItemVo[]>(async () => {
  if (conditionManager.area === undefined || conditionManager.itemType === undefined)
    return []
  const res = await db.item
    .where('typeIdList')
    .equals(conditionManager.itemType.id!)
    .and(({ areaId }) => areaId === conditionManager.area?.id)
    .toArray()
  return res.sort(sort)
}, [])

// ==================== 物品计数 ====================
const totalMarkers = asyncComputed(() => db.marker
  .where('itemIdList')
  .anyOf(itemList.value.map(item => item.id as number))
  .toArray(),
)

const countMarkerItems = (markers: (API.MarkerVo | undefined)[]) => markers.reduce((seed: { [itemId: number]: number }, marker?: API.MarkerVo) => {
  marker?.itemList?.forEach((item) => {
    seed[item.itemId as number] = (seed[item.itemId as number] ?? 0) + 1
  })
  return seed
}, {} as Record<number, number>)

const itemTotalMap = computed(() => countMarkerItems(totalMarkers.value))

const itemCountMap = asyncComputed(async () => {
  const archivedMarkerIds = [...archiveStore.currentArchive.body.Data_KYJG]
  const archivedMarkers = await db.marker.bulkGet(archivedMarkerIds)
  return countMarkerItems(archivedMarkers)
})

// ==================== 打点物品 ====================
const dropzoneRef = ref<HTMLElement | null>(null)
const { isOverDropZone } = useDropZone(dropzoneRef)

const mapStore = useMapStore()
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
  mapStore.markingItem = data
}
</script>

<template>
  <div class="marker-filter genshin-text h-full flex flex-col">
    <FilterTabs v-model="conditionManager.tabKey" :tab-names="conditionManager.tabNames">
      <template #key-0>
        {{ conditionManager.area?.name ?? '无' }}
      </template>
      <template #key-1>
        {{ conditionManager.itemType?.name ?? '无' }}
      </template>
      <template #key-2>
        {{ conditionManager.itemIds.length ? `已选 ${conditionManager.itemIds.length} 项` : '无' }}
      </template>
    </FilterTabs>

    <div class="flex-1 p-2 overflow-hidden" style="max-height: 400px;">
      <div v-if="conditionManager.tabKey === 0" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.parentAreaCode"
          class="flex-1"
          :options="parentAreaList"
          label-key="name"
          value-key="code"
        >
          <template #icon="{ row }">
            <CheckboxImage :src="iconTagStore.iconTagMap[row.iconTag ?? '']?.url" />
          </template>
        </CheckboxGroup>
        <div style="width: 1px; height: 98%; background: #E3DDD140;" />
        <CheckboxGroup
          v-model="conditionManager.areaCode"
          class="flex-1"
          :options="childrenAreaList"
          label-key="name"
          value-key="code"
          @change="conditionManager.next"
        />
      </div>

      <div v-else-if="conditionManager.tabKey === 1" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.itemTypeId"
          class="flex-1"
          :options="itemTypeList"
          label-key="name"
          value-key="id"
          two-col
          @change="conditionManager.next"
        >
          <template #icon="{ row }">
            <CheckboxImage :src="iconTagStore.iconTagMap[row.iconTag ?? '']?.url" />
          </template>
        </CheckboxGroup>
      </div>

      <div v-else-if="conditionManager.tabKey === 2" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.itemIds"
          :options="itemList"
          class="flex-1"
          label-key="name"
          value-key="id"
          multiple
          show-select-all-btn
          two-col
          draggable
        >
          <template #icon="{ row }">
            <CheckboxImage :src="iconTagStore.iconTagMap[row.iconTag ?? '']?.url" />
          </template>
          <template #default="{ row, actived }">
            <ItemButton :item-count-map="itemCountMap" :item-total-map="itemTotalMap" :row="row" :actived="actived" />
          </template>
        </CheckboxGroup>
      </div>
    </div>

    <GSDivider :height="32" color="rgb(100 100 100 / 0.9)" />

    <div class="text-white px-2">
      · 默认打点物品
    </div>

    <div
      ref="dropzoneRef"
      class="marking-item"
      :class="{
        'over-drop': isOverDropZone,
        'checked': Boolean(mapStore.markingItem),
      }"
      @drop="handleDragItem"
    >
      <template v-if="!mapStore.markingItem">
        {{ isOverDropZone ? '放开以应用该物品' : '拖拽物品到此处' }}
      </template>

      <CheckboxItem v-else is-actived :label="mapStore.markingItem.name" style="margin: 0; width: 100%" @click="mapStore.markingItem = null">
        <template #icon>
          <CheckboxImage :src="iconTagStore.iconTagMap[mapStore.markingItem.iconTag ?? '']?.url" />
        </template>
        <template #default>
          <div class="marking-item--content">
            <ItemButton :item-count-map="itemCountMap" :item-total-map="itemTotalMap" :row="mapStore.markingItem" actived />
            <div class="grid px-2 place-items-center" style="background-color: var(--gs-color-danger);">
              <el-icon :size="20" color="#FFF">
                <DeleteFilled />
              </el-icon>
            </div>
          </div>
        </template>
      </CheckboxItem>
    </div>

    <div class="text-white px-2 pb-1">
      · 条件列表
    </div>

    <div class="flex-1 p-2 pb-0 overflow-hidden">
      <el-scrollbar height="100%">
        <div class="h-full flex flex-col gap-2">
          <ConditionRow
            v-for="[id, condition] in conditionManager.conditions"
            :key="id"
            :condition="condition"
            @review="() => conditionManager.reviewCondition(id)"
            @delete="() => conditionManager.deleteCondition(id)"
          />
        </div>
      </el-scrollbar>
    </div>

    <GSDivider :height="32" color="rgb(100 100 100 / 0.9)" />

    <div class="condition-add-btn flex gap-4 justify-center p-2 pb-4 pt-0">
      <GSButton
        class="flex-1"
        :disabled="!conditionManager.conditions.size"
        @click="conditionManager.clearCondition"
      >
        <template #icon>
          <el-icon color="var(--gs-color-danger)">
            <DeleteFilled />
          </el-icon>
        </template>
        清空条件
      </GSButton>
      <GSButton class="flex-1" @click="conditionManagerVisible = true">
        <template #icon>
          <el-icon color="var(--gs-color-confirm)">
            <IconSetting />
          </el-icon>
        </template>
        管理预设
      </GSButton>
    </div>

    <ConditionManager v-model="conditionManagerVisible" />
  </div>
</template>

<style lang="scss" scoped>
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
