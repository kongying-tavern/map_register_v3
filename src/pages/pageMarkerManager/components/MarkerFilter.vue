<script lang="ts" setup>
import type { MarkerSearchParams } from '../hooks'
import { useItemList, useItemType } from '../hooks'
import { useAreaStore } from '@/stores'

const props = defineProps<{
  modelValue: MarkerSearchParams
}>()

const emits = defineEmits<{
  'update:modelValue': [form: MarkerSearchParams]
}>()

const model = <K extends keyof MarkerSearchParams>(key: K) => computed({
  get: () => props.modelValue[key],
  set: v => emits('update:modelValue', { ...props.modelValue, [key]: v }),
})

const parseMarkerIds = (ids: string) => ids.split(',').map(c => Number.parseInt(c.trim())).filter(n => !Number.isNaN(n))

const markerIds = ref('')
const markerIdList = model('markerIdList')
const areaIdList = model('areaIdList')
const typeIdList = model('typeIdList')
const itemIdList = model('itemIdList')

watch(markerIds, (ids) => {
  markerIdList.value = parseMarkerIds(ids)
})

// ==================== 地区 ====================
const areaStore = useAreaStore()
const areaList = computed(() => areaStore.areaList
  .filter(area => area.isFinal)
  .toSorted(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia),
)

// ==================== 类型 ====================
const { typeOptions: itemTypeOptions } = useItemType()

// ==================== 物品 ====================
const { itemOptions } = useItemList({
  params: () => ({
    areaIdList: props.modelValue.areaIdList,
    typeIdList: props.modelValue.typeIdList,
  }),
})

// 当已选物品不存在于物品选项中时，重置已选物品
watch(itemOptions, (options) => {
  for (const itemId of itemIdList.value) {
    if (!options.find(opt => opt.value === itemId)) {
      itemIdList.value = []
      return
    }
  }
})
</script>

<template>
  <el-form class="w-full" label-width="70px">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
      <el-form-item label="点位ID">
        <el-input
          v-model="markerIds"
          placeholder="可使用逗号分隔查询多个"
          style="width: 100%" clearable
        />
      </el-form-item>

      <el-form-item label="所属地区">
        <el-select-v2
          v-model="areaIdList"
          placeholder="请选择地区"
          clearable
          multiple collapse-tags collapse-tags-tooltip
          filterable
          style="width: 100%"
          :options="areaList"
          :props="{ label: 'name', value: 'id' }"
        />
      </el-form-item>

      <el-form-item label="类型">
        <el-select-v2
          v-model="typeIdList"
          placeholder="请选择点位类型"
          node-key="id"
          collapse-tags collapse-tags-tooltip clearable filterable multiple
          style="width: 100%"
          :options="itemTypeOptions"
        />
      </el-form-item>

      <el-form-item label="物品">
        <el-select-v2
          v-model="itemIdList"
          placeholder="请选择物品"
          node-key="id"
          collapse-tags collapse-tags-tooltip clearable filterable multiple
          style="width: 100%"
          :options="itemOptions"
        />
      </el-form-item>

      <el-form-item class="lg:col-start-4 lg:col-end-5 sm:col-start-2 sm:col-end-3 col-start-1 col-end-2">
        <slot name="footer" />
      </el-form-item>
    </div>
  </el-form>
</template>
