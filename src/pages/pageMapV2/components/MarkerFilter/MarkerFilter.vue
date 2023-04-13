<script lang="ts" setup>
import { DeleteFilled, Download } from '@element-plus/icons-vue'
import { CheckboxGroup, ConditionRow, FilterTabs } from '.'
import { useFetchHook } from '@/hooks'
import { GSButton } from '@/components'
import { useCondition } from '@/pages/pageMapV2/hooks'
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

// ==================== 地区 ====================
const parentAreaCode = ref<string>()
const parentAreaList = ref<API.AreaVo[]>([])
const { onSuccess: onAreaFetched } = useFetchHook({
  immediate: true,
  onRequest: () => db.area.filter(area => !area.isFinal).toArray(),
})
onAreaFetched((areaList) => {
  parentAreaList.value = areaList
  parentAreaCode.value = parentAreaList.value[0]?.code
})

const childrenAreaList = asyncComputed<API.AreaVo[]>(async () => {
  if (!parentAreaCode.value)
    return []
  const parentArea = parentAreaList.value.find(area => area.code === parentAreaCode.value) as API.AreaVo
  const res = await db.area.where('parentId').equals(parentArea.areaId as number).toArray()
  conditionManager.areaCode = res[0].code
  return res
}, [])

// ==================== 分类 ====================
const itemTypeList = ref<API.ItemTypeVo[]>([])
const { onSuccess: onTypeFetched } = useFetchHook({
  immediate: true,
  onRequest: async () => {
    const res = await db.itemType.filter(type => Boolean(type.isFinal)).toArray()
    return res.sort(sort)
  },
})
onTypeFetched((typeList) => {
  itemTypeList.value = typeList
})

// ==================== 物品 ====================
const itemList = asyncComputed<API.ItemVo[]>(async () => {
  if (conditionManager.area === undefined || conditionManager.itemType === undefined)
    return []
  const res = await db.item
    .where('areaId')
    .equals(conditionManager.area.areaId as number)
    .and(({ typeIdList = [] }) => typeIdList.includes(conditionManager.itemType?.typeId as number))
    .toArray()
  return res.sort(sort)
}, [])
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
          v-model="parentAreaCode"
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
          value-key="typeId"
          two-col
          @change="next"
        />
      </div>

      <div v-else-if=" tabKey === 2" class="h-full flex gap-1">
        <CheckboxGroup
          v-model="conditionManager.itemIds"
          :options="itemList"
          class="flex-1"
          label-key="name"
          value-key="itemId"
          multiple
          show-select-all-btn
          two-col
        />
      </div>
    </div>

    <div class="condition-add-btn flex gap-2 justify-center p-2">
      <GSButton
        class="flex-1"
        :disabled="conditionManager.isPreRendering"
        @click="conditionManager.clearCondition"
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
        title="当存在重复物品时会自动去重"
        :loading="conditionManager.isPreRendering"
        :disabled="!conditionManager.isConditionAddable.value"
        @click="conditionManager.addCondition"
      >
        <template #icon>
          <el-icon color="#38A2E4">
            <Download />
          </el-icon>
        </template>
        添加条件
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
