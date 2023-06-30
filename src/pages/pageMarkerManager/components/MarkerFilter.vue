<script lang="ts" setup>
import type { MarkerSearchParams } from '../hooks'
import { useItemList, useItemType } from '../hooks'
import { useAreaList } from '@/hooks'

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

const parseMarkerIds = (ids: string) => ids.split(',').map(c => parseInt(c.trim())).filter(n => !isNaN(n))

const markerIds = ref('')
const markerIdList = model('markerIdList')
const areaIdList = model('areaIdList')
const typeIdList = model('typeIdList')
const itemIdList = model('itemIdList')

watch(markerIds, (ids) => {
  markerIdList.value = parseMarkerIds(ids)
})

// ==================== 地区 ====================
const { areaTree } = useAreaList({ immediate: true })

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
  <el-form class="w-full grid grid-cols-4" :inline="true" :model="modelValue">
    <el-form-item label="点位ID">
      <el-input
        v-model="markerIds"
        placeholder="可使用逗号分隔查询多个"
        style="width: 100%" clearable
      />
    </el-form-item>

    <el-form-item label="所属地区">
      <el-tree-select
        v-model="areaIdList"
        placeholder="请选择地区"
        node-key="id"
        accordion collapse-tags collapse-tags-tooltip clearable filterable multiple
        style="width: 100%"
        :data="areaTree"
        :render-after-expand="false"
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
        collapse-tags collapse-tags-tooltip filterable multiple
        style="width: 100%"
        :options="itemOptions"
      />
    </el-form-item>

    <el-form-item style="grid-column: 4;">
      <slot name="footer" />
    </el-form-item>
  </el-form>
</template>
