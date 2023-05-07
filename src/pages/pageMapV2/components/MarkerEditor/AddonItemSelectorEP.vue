<script lang="ts" setup>
import { useAreaList } from '@/hooks'
import { useIconTagStore, useItemTypeStore } from '@/stores'

const props = defineProps<{
  modelValue: API.MarkerItemLinkVo[]
  rawItemList: API.ItemVo[]
  areaCode?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: API.MarkerItemLinkVo[]): void
  (e: 'update:areaCode', v?: string): void
}>()

const iconTagStore = useIconTagStore()
const itemTypeStore = useItemTypeStore()

interface TypeItemObj extends API.ItemTypeVo {
  items: API.ItemVo[]
}

/** 搜索参数 */
const rawQueryText = ref('')
const queryText = debouncedRef(rawQueryText, 300)

const itemList = computed(() => {
  const query = queryText.value.trim()
  return query ? props.rawItemList.filter(item => item.name?.includes(query)) : props.rawItemList
})

const itemActiveMap = computed(() => Object.fromEntries(props.rawItemList.map(item => [
  item.id as number,
  Boolean(props.modelValue.find(modelItem => modelItem.itemId === item.id)),
])))

/** 分类的物品列表 */
const itemGroupByType = computed(() => itemList.value.reduce((seed, item) => {
  item.typeIdList?.forEach((typeId) => {
    if (!seed[typeId]) {
      const typeVO = itemTypeStore.itemTypeMap[typeId]
      seed[typeId] = {
        ...typeVO,
        items: [],
      }
    }
    seed[typeId].items.push(item)
  })
  return seed
}, {} as Record<number, TypeItemObj>))

const selectItem = (item: API.ItemVo, isActive: boolean) => {
  const copy = [...props.modelValue]
  if (!isActive) {
    copy.push({
      count: 1,
      iconTag: item.iconTag,
      itemId: item.id,
    })
  }
  else {
    const existIndex = copy.findIndex(modelItem => modelItem.itemId === item.id)
    if (existIndex < 0)
      return
    copy.splice(existIndex, 1)
  }
  emits('update:modelValue', copy)
}

const { areaTree } = useAreaList({
  immediate: true,
})
</script>

<template>
  <div class="h-full flex flex-col gap-2">
    <el-input v-model="rawQueryText" clearable>
      <template #prepend>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-form>
      <el-form-item label="切换地区">
        <el-cascader
          :model-value="areaTree.length ? areaCode : undefined"
          :options="areaTree"
          :props="{
            label: 'name',
            value: 'code',
            emitPath: false,
          }"
          @update:model-value="v => $emit('update:areaCode', v)"
        />
      </el-form-item>
    </el-form>

    <div class="flex-1 overflow-hidden">
      <el-scrollbar height="100%">
        <template v-for="itemType in itemGroupByType" :key="itemType.typeId">
          <div v-if="itemType.items.length" class="grid grid-cols-2 gap-1 pb-4">
            <div class="col-span-2">
              {{ itemType.name }}
            </div>
            <div
              v-for="item in itemType.items"
              :key="item.id" class="item-button"
              :class="{ active: itemActiveMap[`${item.id}`] }"
              @click="() => selectItem(item, itemActiveMap[`${item.id}`])"
            >
              <img
                :src="iconTagStore.iconTagMap[item.iconTag as string]?.url"
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
      </el-scrollbar>
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
