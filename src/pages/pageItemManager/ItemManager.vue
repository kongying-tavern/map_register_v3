<script lang="tsx" setup>
import { ElButton } from 'element-plus'
import type { AnyColumn } from 'element-plus/es/components/table-v2/src/common'
import { useItemEdit } from './hooks'
import { PgUnit, useAreaList, useIconList, useItemList, usePagination, useTypeList } from '@/hooks'

const { pagination, layout } = usePagination({
  units: [PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})
const checkedArea = ref<API.AreaVo>()
const checkedType = ref<API.ItemTypeVo>()

const { areaMap, areaTree, loading: areaLoading, areaList } = useAreaList({
  immediate: true,
})

const { iconMap, iconList } = useIconList()

const { typeTree, loading: typeLoading } = useTypeList()

const { itemList, loading: itemLoading, onSuccess: onItemListFetched, pause, resume, updateItemList } = useItemList({
  immediate: true,
  params: () => ({
    areaIdList: checkedArea.value ? [checkedArea.value.areaId as number] : [],
    typeIdList: checkedType.value ? [checkedType.value.typeId as number] : [],
    current: pagination.value.current,
    size: pagination.value.pageSize,
  }),
})

/** 在部分参数切换后重置页数 */
const resetPagination = () => {
  pause()
  pagination.value.current = 1
  pagination.value.pageSize = 10
  resume()
}

const onAreaCheckedChange = (area: API.AreaVo) => {
  // TODO 过滤非端点选项
  if ([undefined, 1, 5, 7, 11, 18].includes(area.areaId))
    return
  resetPagination()
  checkedArea.value = area
}

const onTypeCheckedChange = (typeItem: API.ItemTypeVo) => {
  // TODO 目前只有宝箱(id = 9)分类存在子分类，先这样处理
  if (typeItem.typeId === 9)
    return
  resetPagination()
  checkedType.value = typeItem
}

onItemListFetched(({ data: { record = [], total = 0 } = {} }) => {
  console.log('[物品列表]', record)
  pagination.value.total = total
})

const { openItemDetailEditorDialog } = useItemEdit({
  itemList,
})

const onItemDetailEditSuccess = () => {
  updateItemList()
}

const containerRef = ref<HTMLElement | null>(null)
const { height, width } = useElementSize(containerRef)

const columns: AnyColumn[] = [
  { title: '物品ID', dataKey: 'itemId', width: 50 },
  { title: '名称', dataKey: 'name', width: 200 },
  {
    title: '图标',
    width: 200,
    cellRenderer: ({ rowData }) => <img
      class="w-8 h-8 object-contain rounded-full bg-slate-700"
      src={iconMap.value[rowData.iconTag ?? '']}
      referrerpolicy="no-referrer"
    />,
  },
  {
    title: '地区',
    width: 200,
    cellRenderer: ({ rowData }) => <div>
      {areaMap.value[rowData.areaId]?.name ?? rowData.areaId}
    </div>,
  },
  {
    title: '操作',
    width: 200,
    cellRenderer: ({ rowIndex }) => <ElButton
      onClick={() => {
        openItemDetailEditorDialog(rowIndex, {
          props: {
            iconList: iconList.value,
            areaList: areaList.value,
            iconMap: iconMap.value,
          },
          listeners: {
            success: onItemDetailEditSuccess,
          },
        })
      }}
    >编辑</ElButton>,
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
        :props="{ label: 'name' }"
        class="flex-1 overflow-auto"
        accordion
        node-key="areaId"
        highlight-current
        @current-change="onAreaCheckedChange"
      />
      <div>类型</div>
      <el-tree
        v-loading="typeLoading"
        :data="typeTree"
        :props="{ label: 'name', isLeaf: 'isLeaf' }"
        class="flex-1 overflow-auto"
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
