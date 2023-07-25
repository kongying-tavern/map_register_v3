<script lang="ts" setup>
import { CircleCloseFilled, Close, Search, Select } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ItemSelectButton } from '.'
import db from '@/database'
import { GlobalDialogController, useFetchHook, useState } from '@/hooks'
import { useIconTagStore } from '@/stores'
import Api from '@/api/api'

const emits = defineEmits<{
  success: []
}>()

// ==================== 筛选信息 ====================
const queryText = ref('')
const [selectedType, setSelectedType] = useState<API.ItemTypeVo | null>(null)

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
const loading = ref(false)
const itemList = asyncComputed(async () => {
  const typeId = selectedType.value?.id
  const query = queryText.value
  if (typeId === undefined)
    return []
  const items = await db.item
    .where('typeIdList')
    .anyOf([typeId])
    .and(item => !query ? true : (item.name?.includes(query) ?? false))
    .sortBy('name')
  const nameSet = new Set<string>()
  return items.reduce((seed, item) => {
    if (!nameSet.has(item.name!)) {
      seed.push(item)
      nameSet.add(item.name!)
    }
    return seed
  }, [] as API.ItemVo[])
}, [], { lazy: true, evaluating: loading })

// ==================== 已选物品 ====================
const selections = ref(new Set<number>())
const selectionItems = shallowRef<API.ItemVo[]>([])

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

// ==================== 添加至模板 ====================
const { loading: addLoading, refresh: addCommonItem, onSuccess: onCreateSuccess } = useFetchHook({
  onRequest: () => Api.itemCommon.addCommonItem([...selections.value]),
})

onCreateSuccess(() => {
  ElMessage.success({
    message: '添加公共物品成功',
    offset: 48,
  })
  GlobalDialogController.close()
  emits('success')
})
</script>

<template>
  <div class="common-item-selector p-4 flex">
    <div class="sample-item-selecter pr-2 w-80 grid gap-y-2">
      <el-input v-model="queryText" class="col-span-2" placeholder="搜索物品名称" clearable>
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
            <el-image :src="iconMap[itemType.iconTag ?? '']?.url" lazy crossorigin="" class="w-8 h-8 object-contain">
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
        <el-text size="small">
          添加至公共物品：
        </el-text>
        <el-text type="info" size="small">
          已选 {{ selectionItems.length }} 个物品
        </el-text>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <el-scrollbar>
          <ItemSelectButton
            v-for="item in selectionItems"
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
          </ItemSelectButton>
        </el-scrollbar>
      </div>

      <div class="text-end">
        <el-button type="primary" :disabled="!selectionItems.length" :loading="addLoading" @click="addCommonItem">
          确认
        </el-button>
        <el-button :disabled="addLoading" @click="GlobalDialogController.close">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.common-item-selector {
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

.border-left {
  border-left: 1px solid var(--el-border-color);
}
</style>
