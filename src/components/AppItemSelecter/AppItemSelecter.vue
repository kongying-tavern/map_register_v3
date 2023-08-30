<script lang="ts" setup>
import { CircleCloseFilled, Search, Select } from '@element-plus/icons-vue'
import { ElScrollbar } from 'element-plus'
import ItemSelectButton from './ItemSelectButton.vue'
import ItemPreviewButton from './ItemPreviewButton.vue'
import db from '@/database'
import { useFetchHook, useState } from '@/hooks'
import { useIconTagStore } from '@/stores'
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
}>(), {
  showTotal: true,
  showAreaSelector: true,
  totalDirection: 'row',
})

const emits = defineEmits<{
  'update:modelValue': [API.ItemVo[]]
  'update:areaCode': [string]
}>()

// ==================== 地区信息 ====================
const areaId = asyncComputed(async () => {
  if (!props.areaCode)
    return
  const area = await db.area.where('code').equals(props.areaCode).first()
  return area?.id
})

// ==================== 图标信息 ====================
const iconTagStore = useIconTagStore()
const iconMap = computed(() => iconTagStore.iconTagMap)

// ==================== 关键词 ====================
const queryText = ref('')

// ==================== 物品类型 ====================
const [selectedType, setSelectedType] = useState<API.ItemTypeVo | null>(null)

const { data: itemTypeList, onSuccess: onItemTypeFetched } = useFetchHook({
  immediate: true,
  initialValue: [],
  shallow: true,
  onRequest: async () => {
    const itemTypes = await db.itemType.filter(itemType => itemType.isFinal ?? false).toArray()
    return itemTypes.sort(({ sortIndex: sa = 0 }, { sortIndex: sb = 0 }) => sb - sa)
  },
})

onItemTypeFetched((itemTypes) => {
  selectedType.value = itemTypes[0] ?? null
})

// ==================== 物品信息 ====================
const loading = ref(false)
const itemList = asyncComputed(async () => {
  const queryTypeId = selectedType.value?.id
  const queryKeyword = queryText.value.trim()
  const queryAreaId = areaId.value
  if (queryTypeId === undefined)
    return []
  const items = await db.item
    .where('typeIdList')
    .anyOf([queryTypeId])
    .and((item) => {
      const isQueryMatch = !queryKeyword || (item.name?.includes(queryKeyword) ?? false)
      if (!isQueryMatch)
        return false
      return item.areaId === queryAreaId
    })
    .sortBy('name')
  return items
}, [], { evaluating: loading })

// ==================== 已选物品 ====================
const selections = computed(() => new Set<number>(props.modelValue.map(item => item.id!)))

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

const { data: itemTypeMap } = useFetchHook({
  immediate: true,
  initialValue: {},
  shallow: true,
  onRequest: async () => {
    const itemTypes = await db.itemType.toArray()
    return itemTypes.reduce((seed, itemType) => {
      seed[itemType.id!] = itemType
      return seed
    }, {} as { [typeId: string]: API.ItemTypeVo })
  },
})

const toggleItem = (item: API.ItemVo) => {
  const shallowCopy = [...selectionItems.value]
  if (!selections.value.has(item.id!)) {
    shallowCopy.push(item)
    selectionItems.value = shallowCopy
    return
  }
  const index = shallowCopy.findIndex(findItem => findItem.id === item.id)
  if (index > -1)
    shallowCopy.splice(index, 1)
  selectionItems.value = shallowCopy
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
    <div class="sample-item-selecter grid gap-y-2" :class="[showTotal ? 'w-80 pr-2' : 'w-full']">
      <div class="flex flex-col gap-2 col-span-2">
        <AppAreaCodeSelecter v-if="showAreaSelector" :model-value="areaCode" @update:model-value="code => emits('update:areaCode', code)" />

        <el-input v-model="queryText" placeholder="搜索物品名称" clearable>
          <template #prefix>
            <el-icon :size="16">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="w-full h-full overflow-hidden">
        <ElScrollbar class="pr-2">
          <div
            v-for="itemType in itemTypeList"
            :key="itemType.id"
            :title="itemType.name"
            :class="{ actived: itemType.id === selectedType?.id }"
            class="item-type"
            @click="() => setSelectedType(itemType)"
          >
            <img :src="iconMap[itemType.iconTag ?? '']?.url" loading="lazy" class="w-8 h-8 object-contain">
            <el-badge type="primary" :value="groupedItems[itemType.id!]?.length ?? 0" :hidden="!groupedItems[itemType.id!]?.length" style="width: 100%">
              <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ itemType.name }}</span>
            </el-badge>
          </div>
        </ElScrollbar>
      </div>

      <div
        v-loading="loading"
        class="w-full h-full flex flex-col overflow-hidden pl-2 border-left"
        element-loading-text="查询中..."
      >
        <ElScrollbar ref="scrollbarRef">
          <ItemSelectButton
            v-for="item in itemList"
            :key="item.id"
            :item="item"
            :icon-map="iconMap"
            @click="() => toggleItem(item)"
          >
            <template #prepend>
              <div
                class="w-4 h-4 border rounded-full grid place-items-center"
                style="border-color: var(--el-border-color);"
                :style="[
                  selections.has(item.id!)
                    ? 'background-color: var(--el-color-primary); border-color: var(--el-color-primary); color: #FFF;'
                    : 'color: transparent;',
                ]"
              >
                <el-icon :size="14" color="currentColor">
                  <Select />
                </el-icon>
              </div>
            </template>
          </ItemSelectButton>
        </ElScrollbar>
      </div>
    </div>

    <div v-if="showTotal" class="w-52 flex flex-col pl-2 justify-between gap-2 border-left">
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
          <details v-for="(items, key) in groupedItems" :key="key" open class="el-border mb-1 overflow-hidden">
            <summary class="p-1 px-2 text-xs select-none el-bg-primary">
              {{ itemTypeMap[key]?.name ?? '？？？' }}
            </summary>
            <div class="flex gap-1 p-1">
              <ItemPreviewButton
                v-for="item in items"
                :key="item.id"
                :item="item"
                :icon-map="iconMap"
                @click="() => toggleItem(item)"
              >
                <template #append>
                  <el-icon :size="14">
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </ItemPreviewButton>
            </div>
          </details>
        </ElScrollbar>
      </div>

      <slot name="append" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-selector {
  height: var(--selecter-height, 500px);
}

.sample-item-selecter {
  grid-template-columns: 120px auto;
  grid-template-rows: auto 1fr;
}

.item-type {
  padding: 4px 12px 4px 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;

  &:not(.actived):hover {
    background-color: var(--el-color-primary-light-9);
  }
  &:not(.actived):active {
    background-color: var(--el-color-primary-light-7);
  }
  &.actived {
    background-color: var(--el-color-primary);
    color: #FFF;
  }
}

.el-border {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.el-bg-primary {
  background-color: var(--el-color-primary-light-8);
}

.border-left {
  border-left: 1px dashed var(--el-border-color);
}
</style>
