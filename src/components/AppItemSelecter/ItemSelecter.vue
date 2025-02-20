<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { ElScrollbar } from 'element-plus'
import ItemSelectButton from './ItemSelectButton.vue'
import ItemPreviewButton from './ItemPreviewButton.vue'
import TypeSelectButton from './TypeSelectButton.vue'
import { useState } from '@/hooks'
import { useAreaStore, useIconTagStore, useItemStore, useItemTypeStore } from '@/stores'
import { AppAreaCodeSelecter } from '@/components'

const props = withDefaults(defineProps<{
  modelValue: API.ItemVo[]
  areaCode?: string
  title?: string
  totalDirection?: 'row' | 'column'
  height?: string
  width?: string
  showTotal?: boolean
  showAreaSelector?: boolean
  isAreaDisabled?: (area: API.AreaVo) => boolean
}>(), {
  showTotal: true,
  showAreaSelector: true,
  totalDirection: 'row',
})

const emits = defineEmits<{
  'update:modelValue': [API.ItemVo[]]
  'update:areaCode': [string]
}>()

const areaStore = useAreaStore()
const itemStore = useItemStore()
const itemTypeStore = useItemTypeStore()

const sorter = ({ sortIndex: sa = 0 }: { sortIndex?: number }, { sortIndex: sb = 0 }: { sortIndex?: number }) => {
  return sb - sa
}

// ==================== 地区信息 ====================
/** 当没有传入外部地区代码时使用内置缓存 */
const internalAreaCode = ref('')

const modelAreaCode = computed({
  get: () => props.areaCode ?? internalAreaCode.value,
  set: (code) => {
    if (props.areaCode === undefined) {
      internalAreaCode.value = code
      return
    }
    emits('update:areaCode', code)
  },
})

const areaId = computed(() => areaStore.areaCodeMap.get(modelAreaCode.value)?.id)

// ==================== 图标信息 ====================
const iconTagStore = useIconTagStore()
const iconMap = computed(() => iconTagStore.iconTagMap)

// ==================== 关键词 ====================
const queryText = ref('')

// ==================== 物品类型 ====================
const itemTypeList = computed(() => {
  return itemTypeStore.itemTypeList
    .filter(({ isFinal }) => isFinal)
    .sort(sorter)
})

const [selectedType, setSelectedType] = useState<API.ItemTypeVo | null>(itemTypeList.value[0] ?? null)

// ==================== 物品信息 ====================
const itemList = computed(() => {
  const queryTypeId = selectedType.value?.id
  const queryKeyword = queryText.value.trim()
  const queryAreaId = areaId.value
  if (queryTypeId === undefined)
    return []
  const items = itemStore.itemList
    .filter(({ name = '', areaId = -1, typeIdList = [] }) => {
      if (!new Set(typeIdList).has(queryTypeId))
        return false
      const isQueryMatch = !queryKeyword || (name.includes(queryKeyword) ?? false)
      if (!isQueryMatch)
        return false
      return areaId === queryAreaId
    })
  return items.sort(sorter)
})

// ==================== 已选物品 ====================
const selectionsMap = computed(() => props.modelValue.reduce((seed, item) => {
  return seed.set(item.id!, item)
}, new Map<number, API.ItemVo>()))

const selectionItems = computed({
  get: () => props.modelValue,
  set: items => emits('update:modelValue', items),
})

const groupedItems = computed(() => selectionItems.value.reduce((seed, item) => {
  item.typeIdList?.forEach((typeId) => {
    if (!seed[typeId])
      seed[typeId] = []
    seed[typeId].push(item)
  })
  return seed
}, {} as { [typeId: string]: API.ItemVo[] }))

const toggleItem = (item: API.ItemVo) => {
  const map = new Map(selectionsMap.value)
  if (map.has(item.id!))
    map.delete(item.id!)
  else
    map.set(item.id!, item)
  selectionItems.value = [...map].map(([_, item]) => item)
}

const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null)
watch(() => itemList.value, () => scrollbarRef.value?.setScrollTop(0))
</script>

<template>
  <div
    class="item-selector flex overflow-hidden"
    v-bind="$attrs"
    :style="{
      '--selecter-height': props.height,
    }"
  >
    <div
      class="grid grid-cols-[100px_auto] grid-rows-[auto_1fr] gap-y-2"
      :class="[showTotal ? 'w-80 pr-2' : 'w-full']"
    >
      <div class="flex flex-col gap-2 col-span-2">
        <AppAreaCodeSelecter
          v-if="showAreaSelector"
          v-model="modelAreaCode"
          :is-area-disabled="isAreaDisabled"
        />

        <el-input v-model="queryText" placeholder="搜索物品名称" clearable>
          <template #prefix>
            <el-icon :size="16">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="w-full h-full overflow-hidden">
        <ElScrollbar class="pr-1">
          <TypeSelectButton
            v-for="itemType in itemTypeList"
            :key="itemType.id"
            :item-type="itemType"
            :actived="itemType.id === selectedType?.id"
            :src="iconTagStore.tagSpriteUrl"
            :mapping="iconTagStore.tagPositionMap[itemType.iconTag ?? '']"
            :nums="groupedItems[itemType.id!]?.length"
            @click="() => setSelectedType(itemType)"
          />
        </ElScrollbar>
      </div>

      <div class="w-full h-full flex flex-col overflow-hidden pl-1 border-l-[1px] border-dashed border-[var(--el-border-color)]">
        <div v-if="!modelAreaCode" class="w-full h-full grid place-items-center">
          请选择地区
        </div>
        <ElScrollbar v-else ref="scrollbarRef">
          <div class="grid grid-cols-2 gap-1">
            <ItemSelectButton
              v-for="item in itemList"
              :key="item.id"
              :item="item"
              :icon-map="iconMap"
              :actived="selectionsMap.has(item.id!)"
              :src="iconTagStore.tagSpriteUrl"
              :mapping="iconTagStore.tagPositionMap[item.iconTag ?? '']"
              @click="() => toggleItem(item)"
            />
          </div>
        </ElScrollbar>
      </div>
    </div>

    <div
      v-if="showTotal"
      class="w-52 flex flex-col pl-2 justify-between gap-2 border-l-[1px] border-dashed border-[var(--el-border-color)]"
    >
      <div class="flex justify-between px-1">
        <el-text v-if="title" size="small">
          {{ title }}
        </el-text>
        <el-text type="info" size="small">
          已选 {{ selectionItems.length }} 个物品
        </el-text>
      </div>

      <div class="flex-1 overflow-hidden">
        <ElScrollbar>
          <details
            v-for="(items, key) in groupedItems"
            :key="key"
            open
            class="mb-1 overflow-hidden border border-[var(--el-border-color)] rounded"
          >
            <summary class="p-1 px-2 text-xs select-none bg-[var(--el-color-primary-light-8)]">
              {{ `${itemTypeStore.itemTypeIdMap.get(Number(key))?.name ?? 'unknown'} (${items.length})` }}
            </summary>
            <div class="flex flex-wrap gap-1 p-1">
              <ItemPreviewButton
                v-for="item in items"
                :key="item.id"
                :item="item"
                :icon-map="iconMap"
                :src="iconTagStore.tagSpriteUrl"
                :mapping="iconTagStore.tagPositionMap[item.iconTag ?? '']"
                @click="() => toggleItem(item)"
              />
            </div>
          </details>
        </ElScrollbar>
      </div>

      <slot name="append" />
    </div>
  </div>
</template>

<style scoped>
.item-selector {
  height: var(--selecter-height, 500px);
}
</style>
