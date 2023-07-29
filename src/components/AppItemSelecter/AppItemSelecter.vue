<script lang="ts" setup>
import { CircleCloseFilled, Close, Search, Select } from '@element-plus/icons-vue'
import type { CascaderProps } from 'element-plus'
import ItemSelectButton from './ItemSelectButton.vue'
import ItemPreviewButton from './ItemPreviewButton.vue'
import db from '@/database'
import { useFetchHook, useState } from '@/hooks'
import { useIconTagStore } from '@/stores'

const props = defineProps<{
  modelValue: API.ItemVo[]
  title?: string
}>()

const emits = defineEmits<{
  'update:modelValue': [API.ItemVo[]]
}>()

// ==================== 筛选信息 ====================
const queryText = ref('')

const [selectedType, setSelectedType] = useState<API.ItemTypeVo | null>(null)

const areaIds = ref<number[]>([])
const areaId = computed(() => areaIds.value.at(-1))

const areaCascaderProps: CascaderProps = {
  lazy: true,
  label: 'name',
  value: 'id',
  leaf: 'isFinal',
  lazyLoad: (node, resolve) => {
    const { level } = node
    if (level === 0)
      return db.area.where('parentId').equals(-1).toArray().then(resolve)
    db.area.where('parentId').equals(node.value).toArray().then(resolve)
  },
}

// ==================== 图标信息 ====================
const iconTagStore = useIconTagStore()
const iconMap = computed(() => iconTagStore.iconTagMap)

// ==================== 物品类型 ====================
const typeList = shallowRef<API.ItemTypeVo[]>([])

const { onSuccess: onItemTypeFetched } = useFetchHook({
  immediate: true,
  onRequest: async () => {
    const itemTypes = await db.itemType.filter(itemType => itemType.isFinal ?? false).toArray()
    return itemTypes.sort(({ sortIndex: sa = 0 }, { sortIndex: sb = 0 }) => sb - sa)
  },
})

onItemTypeFetched((itemTypes) => {
  typeList.value = itemTypes
  selectedType.value = itemTypes[0] ?? null
})

// ==================== 物品信息 ====================
const itemList = shallowRef<API.ItemVo[]>([])

const { loading, onSuccess: onItemFetched, refresh: updateItemList } = useFetchHook({
  onRequest: async () => {
    const typeId = selectedType.value?.id
    const query = queryText.value
    if (typeId === undefined)
      return []
    const items = await db.item
      .where('typeIdList')
      .anyOf([typeId])
      .and((item) => {
        const isQueryMatch = !query || (item.name?.includes(query) ?? false)
        if (!isQueryMatch)
          return false
        const isAreaMatch = areaId.value === undefined || (item.areaId === areaId.value)
        return isAreaMatch
      })
      .sortBy('name')
    return items
  },
})

onItemFetched((items) => {
  itemList.value = items
})

watch(() => [queryText.value, selectedType.value, areaId.value], updateItemList)

// ==================== 已选物品 ====================
const selections = ref(new Set<number>(props.modelValue.map(item => item.id!)))

const selectionItems = computed({
  get: () => props.modelValue,
  set: items => emits('update:modelValue', items),
})

const groupedItems = computed(() => selectionItems.value.reduce((seed, item) => {
  item.typeIdList?.forEach((typeId) => {
    if (!(typeId in seed))
      seed[typeId] = []
    seed[typeId].push(item)
  })
  return seed
}, {} as Record<number, API.ItemVo[]>))

const typeIds = computed(() => Object.keys(groupedItems.value).map(Number))

const typeMap = asyncComputed(async () => {
  const types = await db.itemType.bulkGet(typeIds.value)
  return types.reduce((seed, typeItem) => {
    if (typeItem)
      seed[typeItem.id!] = typeItem
    return seed
  }, {} as Record<number, API.ItemTypeVo>)
}, {})

const toggleItem = (item: API.ItemVo) => {
  const shallowCopy = [...selectionItems.value]
  if (!selections.value.has(item.id!)) {
    selections.value.add(item.id!)
    shallowCopy.push(item)
    selectionItems.value = shallowCopy
    return
  }
  selections.value.delete(item.id!)
  const index = shallowCopy.findIndex(findItem => findItem.id === item.id)
  if (index > -1)
    shallowCopy.splice(index, 1)
  selectionItems.value = shallowCopy
}
</script>

<template>
  <div class="item-selector flex" v-bind="$attrs">
    <div class="sample-item-selecter pr-2 w-80 grid gap-y-2">
      <el-cascader v-model="areaIds" :props="areaCascaderProps" placeholder="选择地区" class="col-span-2" />

      <el-input v-model="queryText" placeholder="搜索物品名称" clearable class="col-span-2">
        <template #prefix>
          <el-icon :size="16">
            <Search />
          </el-icon>
        </template>
      </el-input>

      <div class="w-full h-full overflow-hidden pr-2">
        <el-scrollbar>
          <div
            v-for="itemType in typeList"
            :key="itemType.id"
            :title="itemType.name"
            :class="{ actived: itemType.id === selectedType?.id }"
            class="item-type"
            @click="() => setSelectedType(itemType)"
          >
            <el-image :src="iconMap[itemType.iconTag ?? '']?.url" lazy crossorigin="" fit="contain" class="w-8 h-8 object-contain">
              <template #error>
                <el-icon :size="32" color="var(--el-color-danger)">
                  <Close />
                </el-icon>
              </template>
            </el-image>
            <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ itemType.name }}</span>
          </div>
        </el-scrollbar>
      </div>

      <div
        v-loading="loading"
        class="w-full h-full flex flex-col overflow-hidden pl-2 border-left"
        element-loading-text="查询中..."
      >
        <el-scrollbar>
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
        </el-scrollbar>
      </div>
    </div>

    <div class="w-52 flex flex-col pl-2 justify-between gap-2 border-left">
      <div class="flex justify-between px-1">
        <el-text v-if="title" size="small">
          {{ title }}
        </el-text>
        <el-text type="info" size="small">
          已选 {{ selectionItems.length }} 个物品
        </el-text>
      </div>

      <div class="flex-1 overflow-hidden">
        <el-scrollbar>
          <details v-for="(items, key) in groupedItems" :key="key" open class="el-border mb-1 overflow-hidden">
            <summary class="p-1 px-2 text-xs select-none el-bg-primary">
              {{ typeMap[key]?.name ?? '？？？' }}
            </summary>
            <div class="grid grid-cols-4 gap-1 p-1">
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
        </el-scrollbar>
      </div>

      <slot name="append" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-selector {
  height: 500px;
  overflow: hidden;
}

.sample-item-selecter {
  grid-template-columns: 120px auto;
}

.item-type {
  padding: 4px;
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
  border-left: 1px solid var(--el-border-color);
}
</style>
