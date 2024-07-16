<script lang="ts" setup>
import { CirclePlus } from '@element-plus/icons-vue'
import type { ItemQueryForm } from '../hooks'
import { useAreaStore, useItemTypeStore } from '@/stores'

defineEmits<{
  create: []
  change: []
}>()

const modelValue = defineModel<ItemQueryForm>('modelValue', {
  required: true,
})

const areaStore = useAreaStore()
const itemTypeStore = useItemTypeStore()

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
  <el-form class="w-full p-2 border-b-[1px] border-[var(--el-border-color-lighter)]">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      <el-form-item label="物品名称" style="margin-bottom: 0">
        <el-input
          v-model="modelValue.name"
          clearable
          placeholder="请输入物品名称"
          style="width: 100%;"
          @change="() => $emit('change')"
        />
      </el-form-item>

      <el-form-item label="所属地区" style="margin-bottom: 0">
        <el-select-v2
          v-model="modelValue.areaId"
          :options="areaList"
          :props="{ label: 'name', value: 'id' }"
          clearable
          filterable
          @change="() => $emit('change')"
        />
      </el-form-item>

      <el-form-item label="物品类型" style="margin-bottom: 0">
        <el-select-v2
          v-model="modelValue.itemTypeId"
          :options="typeList"
          :props="{ label: 'name', value: 'id' }"
          clearable
          filterable
          @change="() => $emit('change')"
        />
      </el-form-item>

      <el-form-item label-width="0px" style="margin-bottom: 0">
        <div class="w-full flex items-center justify-end">
          <el-button text :icon="CirclePlus" @click="() => $emit('create')">
            新增
          </el-button>
        </div>
      </el-form-item>
    </div>
  </el-form>
</template>
