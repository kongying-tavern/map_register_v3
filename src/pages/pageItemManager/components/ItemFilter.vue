<script lang="ts" setup>
import type { ItemQueryForm } from '../hooks'
import { useAreaStore, useItemTypeStore } from '@/stores'

const props = defineProps<{
  modelValue: ItemQueryForm
}>()

const emits = defineEmits<{
  'update:modelValue': [form: ItemQueryForm]
}>()

const areaStore = useAreaStore()
const itemTypeStore = useItemTypeStore()

const model = <K extends keyof ItemQueryForm>(key: K) => computed({
  get: () => props.modelValue[key],
  set: v => emits('update:modelValue', { ...props.modelValue, [key]: v }),
})

const name = model('name')
const areaId = model('areaId')
const itemTypeId = model('itemTypeId')

const areaList = computed(() => {
  return areaStore.areaList
    .filter(({ isFinal }) => isFinal)
    .toSorted(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
})

const typeList = computed(() => {
  return itemTypeStore.itemTypeList
    .filter(({ isFinal }) => isFinal)
    .toSorted(({ sortIndex: ia = 0 }, { sortIndex: ib = 0 }) => ib - ia)
})
</script>

<template>
  <el-form>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      <el-form-item label="物品名称">
        <el-input v-model="name" clearable placeholder="当前筛选项正在改造中" style="width: 100%;" disabled />
      </el-form-item>

      <el-form-item label="所属地区">
        <el-select-v2
          v-model="areaId"
          :options="areaList"
          :props="{ label: 'name', value: 'id' }"
          clearable
          filterable
        />
      </el-form-item>

      <el-form-item label="物品类型">
        <el-select-v2
          v-model="itemTypeId"
          :options="typeList"
          :props="{ label: 'name', value: 'id' }"
          clearable
          filterable
        />
      </el-form-item>

      <el-form-item v-if="$slots.footer" label-width="0px">
        <slot name="footer" />
      </el-form-item>
    </div>
  </el-form>
</template>
