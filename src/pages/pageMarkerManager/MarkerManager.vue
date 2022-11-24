<script lang="ts" setup>
import type { TableV2Props } from 'element-plus'
import { useMarkerList } from './hooks'
import { useAreaList, useTypeList } from '@/hooks'

const areaId = ref()

const { areaTree } = useAreaList()
const { typeId, typeTree, onTypeLoad } = useTypeList()

const { markerList, loading, updateMarkerList } = useMarkerList({
  // params: () => ({
  //   areaIdList: isEmpty(areaId.value) ? [] : [areaId.value],
  //   itemIdList: isEmpty(typeId.value) ? [] : [typeId.value],
  //   typeIdList: [],
  //   getBeta: false,
  // }),
})

const columns: TableV2Props['columns'] = [
  { title: 'ID', dataKey: 'id', width: 100 },
  { title: '名称', dataKey: 'markerTitle', width: 300 },
  { title: '坐标', dataKey: 'position', width: 150 },
  { title: '说明', dataKey: 'content', width: 400 },
]
</script>

<template>
  <div class="h-full overflow-hidden flex flex-col">
    <div class="flex gap-2">
      <el-tree-select
        v-model="areaId"
        :data="areaTree"
        :props="{ label: 'name', value: 'areaId' }"
        placeholder="地区"
        filterable
        clearable
        collapse-tags-tooltip
      />
      <el-tree-select
        v-model="typeId"
        :data="typeTree"
        :props="{ label: 'name', value: 'typeId' }"
        :load="onTypeLoad"
        lazy
        placeholder="类型"
        filterable
        clearable
        collapse-tags-tooltip
      />
      <el-button disabled type="primary" @click="updateMarkerList">
        筛选（待修改）
      </el-button>
    </div>

    <div v-loading="loading" class="flex-1" element-loading-text="加载中...">
      <el-auto-resizer>
        <template #default="{ width, height }">
          <el-table-v2
            :width="width"
            :height="height"
            :columns="columns"
            :data="markerList"
          />
        </template>
      </el-auto-resizer>
    </div>
  </div>
</template>
