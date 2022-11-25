<script lang="tsx" setup>
import { ElButton } from 'element-plus'
import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common'
import { PgUnit, useAreaList, useItemList, usePagination, useTypeList } from '@/hooks'

const { pagination, layout } = usePagination({
  units: [PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

const { areaMap, areaTree, loading: areaLoading } = useAreaList({
  immediate: true,
})
const checkedArea = ref<API.AreaVo>()
const onAreaCheckedChange = (area: API.AreaVo) => {
  checkedArea.value = area
}

const { typeList, loading: typeLoading, onTypeLoad } = useTypeList()
const checkedType = ref<API.ItemTypeVo>()
const onTypeCheckedChange = (typeItem: API.ItemTypeVo) => {
  checkedType.value = typeItem
}

const { itemList, loading: itemLoading, onSuccess: onItemListFetched } = useItemList({
  immediate: true,
  params: () => ({
    areaIdList: checkedArea.value ? [checkedArea.value.areaId as number] : [],
    typeIdList: checkedType.value ? [checkedType.value.typeId as number] : [],
    current: pagination.value.current,
    size: pagination.value.pageSize,
  }),
})

onItemListFetched(({ data: { record = [], total = 0 } = {} }) => {
  console.log('[物品列表]', record)
  pagination.value.total = total
})

const containerRef = ref<HTMLElement | null>(null)
const { height, width } = useElementSize(containerRef)

const columns: AnyColumn[] = [
  { title: '物品ID', dataKey: 'itemId', width: 50 },
  { title: '名称', dataKey: 'name', width: 200 },
  {
    title: '地区',
    width: 200,
    cellRenderer: ({ rowData }) => <div>{areaMap.value[rowData.areaId]?.name ?? rowData.areaId}</div>,
  },
  {
    title: '操作',
    width: 200,
    cellRenderer: () => <ElButton>编辑</ElButton>,
  },
]
</script>

<template>
  <div class="h-full flex gap-2">
    <div class="h-full w-40 flex flex-col gap-2 overflow-hidden">
      <div>地区</div>
      <el-tree
        v-loading="areaLoading"
        :data="areaTree"
        :props="{ label: 'name', value: 'areaId' }"
        :expand-on-click-node="false"
        class="flex-1 overflow-auto"
        accordion
        node-key="areaId"
        highlight-current
        @current-change="onAreaCheckedChange"
      />
      <div>类型</div>
      <el-tree
        v-loading="typeLoading"
        :data="typeList"
        :props="{ label: 'name', value: 'typeId' }"
        :load="onTypeLoad"
        :expand-on-click-node="false"
        class="flex-1 overflow-auto"
        lazy
        accordion
        node-key="typeId"
        highlight-current
        @current-change="onTypeCheckedChange"
      />
    </div>

    <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden">
      <div class="flex gap-2">
        <div v-show="checkedArea">
          {{ checkedArea?.name }}
        </div>
        <div v-show="checkedType">
          {{ checkedType?.name }}
        </div>
      </div>
      <div ref="containerRef" v-loading="itemLoading" class="flex-1 overflow-hidden">
        <el-table-v2
          :columns="columns"
          :data="itemList"
          :width="width"
          :height="height"
          :border="true"
        />
      </div>
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :layout="layout"
        :page-sizes="[10, 20, 30, 40]"
        :pager-count="5"
        class="flex justify-end items-center"
        background
      />
    </div>
  </div>
</template>
