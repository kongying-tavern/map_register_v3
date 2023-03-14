<script lang="ts" setup>
import db from '@/database'
import { useIconList, useTypeList } from '@/hooks'

const props = defineProps<{
  modelValue: API.MarkerItemLinkVo[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
}>()

const { typeMap } = useTypeList()
const { iconMap } = useIconList()

interface ItemExtraObj extends API.ItemVo {
  active: boolean
}

interface TypeItemObj extends API.ItemTypeVo {
  items: ItemExtraObj[]
}

/** 搜索参数 */
const queryText = ref('')
const debounceQueryText = debouncedRef(queryText, 300)

const itemList = asyncComputed(async () => {
  const firstItemId = props.modelValue?.[0]?.itemId
  if (firstItemId === undefined)
    return [] as API.ItemVo[]
  const item = await db.item.get(firstItemId)
  if (!item)
    return [] as API.ItemVo[]
  return db.item
    .where('areaId')
    .anyOf(item.areaId !== undefined ? [item.areaId] : [])
    .toArray()
}, [])

/** 分类的物品列表 */
const itemTree = computed(() => itemList.value.reduce((seed, item) => {
  const query = debounceQueryText.value.trim()
  item.typeIdList?.forEach((typeId) => {
    if (!seed[typeId]) {
      const typeVO = typeMap.value[typeId]
      seed[typeId] = {
        ...typeVO,
        items: [],
      }
    }
    (!query || (item.name?.includes(query))) && seed[typeId].items.push({
      ...item,
      active: Boolean(props.modelValue.find(modelItem => modelItem.itemId === item.itemId)),
    })
  })
  return seed
}, {} as Record<number, TypeItemObj>))

const selectItem = (item: ItemExtraObj) => {
  const copy = [...props.modelValue]
  if (!item.active) {
    copy.push({
      count: 1,
      iconTag: item.iconTag,
      itemId: item.itemId,
    })
  }
  else {
    const existIndex = copy.findIndex(modelItem => modelItem.itemId === item.itemId)
    if (existIndex < 0)
      return
    copy.splice(existIndex, 1)
  }
  emits('update:modelValue', copy)
}
</script>

<template>
  <div class="h-full flex flex-col gap-2">
    <el-input v-model="queryText" clearable>
      <template #prepend>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <div class="flex-1 overflow-auto">
      <template v-for="itemType in itemTree" :key="itemType.typeId">
        <div v-if="itemType.items.length" class="grid grid-cols-2 gap-1 pb-4">
          <div class="col-span-2">
            {{ itemType.name }}
          </div>
          <div
            v-for="item in itemType.items"
            :key="item.itemId" class="item-button"
            :class="{ active: item.active }"
            @click="() => selectItem(item)"
          >
            <img
              :src="iconMap[item.iconTag as string]"
              referrerpolicy="no-referrer"
              loading="lazy"
              crossorigin=""
              class="w-6 aspect-square object-contain"
            >
            <div class="flex-1 leading-6 overflow-hidden text-ellipsis whitespace-nowrap">
              {{ item.name }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-button {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  padding: 4px;
  gap: 4px;
  display: flex;
  transition: var(--el-transition-all);
  cursor: pointer;
  &:hover {
    border-color: var(--el-border-color-hover);
  }
  &.active {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    border-color: var(--el-color-primary);
  }
}
</style>
