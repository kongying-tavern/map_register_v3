<script lang="ts" setup>
import { DeleteFilled, Download } from '@element-plus/icons-vue'
import { CheckboxGroup, ConditionRow, FilterTabs } from '.'
import { GSButton } from '@/components'
import { useCondition } from '@/pages/pageMapV2/hooks'
import { FALLBACK_ITEM_ICON_URL } from '@/shared/constant'
import db from '@/database'

// ==================== 其他 ====================
interface Sortable {
  sortIndex?: number
}
const sort = (a: Sortable, b: Sortable) => {
  const { sortIndex: ia = 0 } = a
  const { sortIndex: ib = 0 } = b
  return ib - ia
}

// ==================== 筛选器头 ====================
const tabNames = ref(['地区', '分类', '物品'])
const tabKey = ref(0)

const next = () => {
  if (tabKey.value >= tabNames.value.length)
    return
  tabKey.value += 1
}

// ==================== 筛选条件 ====================
const conditionManager = useCondition()

// ==================== 图标 ====================
const iconTagMap = shallowRef(new Map<string, string>())
onMounted(() => db.iconTag.each((iconTag) => {
  iconTagMap.value.set(iconTag.tag as string, iconTag.url as string)
}))

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
    .where('areaId')
    .equals(conditionManager.area.id as number)
    .and(({ typeIdList = [] }) => typeIdList.includes(conditionManager.itemType?.id as number))
    .toArray()
  return res.sort(sort)
}, [])
const lastLength = ref<number>(0) // 上一次选中物品数目
const itemChange = () => {
  if (lastLength.value > conditionManager.itemIds.length)
    console.log('del')

  console.log(conditionManager.itemIds)
  conditionManager.addCondition()
}
</script>

<template>
  <div class="marker-filter h-full flex flex-col">
    <FilterTabs v-model="tabKey" :tab-names="tabNames">
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

    <div class="flex-1 p-2 pb-0 overflow-hidden">
      <div v-if="tabKey === 0" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.parentAreaCode"
          class="flex-1"
          :options="parentAreaList"
          label-key="name"
          value-key="code"
        />
        <div style="width: 1px; height: 98%; background: #E3DDD140;" />
        <CheckboxGroup
          v-model="conditionManager.areaCode"
          class="flex-1"
          :options="childrenAreaList"
          label-key="name"
          value-key="code"
          @change="next"
        />
      </div>

      <div v-else-if=" tabKey === 1" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.itemTypeId"
          class="flex-1"
          :options="itemTypeList"
          label-key="name"
          value-key="id"
          two-col
          @change="next"
        >
          <template #icon="{ row }">
            <img
              class="w-full h-full rounded-full bg-slate-500 object-contain"
              :src="iconTagMap.get(row.iconTag) ?? FALLBACK_ITEM_ICON_URL"
              crossorigin=""
              loading="lazy"
              decoding="async"
            >
          </template>
        </CheckboxGroup>
      </div>

      <div v-else-if=" tabKey === 2" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.itemIds"
          :options="itemList"
          class="flex-1"
          label-key="name"
          value-key="id"
          multiple
          show-select-all-btn
          two-col
          @change="itemChange"
        >
          <template #icon="{ row }">
            <img
              class="w-full h-full rounded-full bg-slate-500 object-contain"
              :src="iconTagMap.get(row.iconTag) ?? FALLBACK_ITEM_ICON_URL"
              crossorigin=""
              loading="lazy"
              decoding="async"
            >
          </template>
        </CheckboxGroup>
      </div>
    </div>

    <div class="condition-add-btn flex gap-2 justify-center p-2">
      <GSButton
        class="flex-1"
        :disabled="conditionManager.isPreRendering || !conditionManager.conditions.size"
        @click="conditionManager.clearCondition"
      >
        <template #icon>
          <el-icon color="var(--gs-color-danger)">
            <DeleteFilled />
          </el-icon>
        </template>
        清空条件
      </GSButton>
    </div>

    <div class="flex-1 p-2 overflow-hidden">
      <el-scrollbar height="100%">
        <div class="h-full flex flex-col gap-2">
          <ConditionRow
            v-for="[id, condition] in conditionManager.conditions"
            :key="id"
            :condition="condition"
            @delete="() => conditionManager.deleteCondition(id)"
          />
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>
