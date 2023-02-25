<script lang="tsx" setup>
import type { Ref } from 'vue'
import { useItemCreate, useItemEdit } from './hooks'
import { PgUnit, useAreaList, useIconList, useItemDelete, useItemList, usePagination, useTypeList } from '@/hooks'

const { pagination, layout } = usePagination({
  units: [PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})
const checkedArea = ref<API.AreaVo>()
const checkedType = ref<API.ItemTypeVo>()

const { areaMap, areaTree, loading: areaLoading } = useAreaList({
  immediate: true,
})

const { iconMap } = useIconList({ immediate: true })
const { typeTree, loading: typeLoading } = useTypeList({ immediate: true })
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
  if (!area.isFinal)
    return
  resetPagination()
  checkedArea.value = area
}

const onTypeCheckedChange = (typeItem: API.ItemTypeVo) => {
  if (!typeItem.isFinal)
    return
  resetPagination()
  checkedType.value = typeItem
}

onItemListFetched(({ total = 0 }) => {
  pagination.value.total = total
})

const { openItemDetailEditorDialog } = useItemEdit({
  onItemDetailEditSuccess: updateItemList,
})

const { openItemCreatorDialog } = useItemCreate({
  defaultItemData: () => ({
    areaId: checkedArea.value?.areaId,
    typeIdList: checkedType.value ? [checkedType.value.typeId as number] : [],
  }),
  onCreateItemSuccess: updateItemList,
})

const containerRef = ref<HTMLElement | null>(null)
const { height, width } = useElementSize(containerRef)

const selection = ref<API.ItemVo[]>([])
const deleteOneItem = ref<API.ItemVo[]>([])

const getDeleteParams = () => {
  const transform = (items: Ref<API.ItemVo[]>) => items.value.map(item => item.itemId ?? -1).filter(id => id !== -1)
  if (deleteOneItem.value.length)
    return transform(deleteOneItem)
  return transform(selection)
}

const { refresh: deleteItem, onSuccess: onDeleteItemSuccess, loading: deleteLoading } = useItemDelete({
  params: getDeleteParams,
})

onDeleteItemSuccess(() => {
  deleteOneItem.value = []
  updateItemList()
})

const removeRow = (row: API.ItemVo) => {
  deleteOneItem.value = [row]
  deleteItem()
}
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
        <div v-show="!checkedArea && !checkedType">
          选择地区或类型
        </div>
        <div v-show="checkedArea">
          {{ checkedArea?.name }}
        </div>
        <div v-show="checkedType">
          {{ checkedType?.name }}
        </div>
      </div>
      <div class="flex items-center justify-end gap-2">
        <div class="text-sm">
          {{ selection.length ? `已选${selection.length}个物品` : '' }}
        </div>
        <el-button
          type="danger"
          plain
          :loading="deleteLoading"
          :disabled="!selection.length"
          @click="deleteItem"
        >
          批量删除
        </el-button>
        <el-button type="primary" @click="openItemCreatorDialog">
          新建物品
        </el-button>
      </div>
      <div ref="containerRef" v-loading="itemLoading" class="flex-1 overflow-hidden">
        <el-table
          :data="itemList"
          :width="width"
          :height="height"
          :border="true"
          @selection-change="(val) => selection = val"
        >
          <el-table-column align="center" type="selection" width="50" />
          <el-table-column label="物品ID" prop="itemId" width="70" />
          <el-table-column label="名称" prop="name" width="200" />
          <el-table-column label="图标" width="100">
            <template #default="{ row }">
              <img
                class="w-8 h-8 object-contain rounded-full bg-slate-700"
                :src="iconMap[row.iconTag ?? '']"
                referrerpolicy="no-referrer"
                crossorigin=""
              >
            </template>
          </el-table-column>
          <el-table-column label="描述模板" prop="defaultContent" />
          <el-table-column label="地区" width="200">
            <template #default="{ row }">
              <div>{{ areaMap[row.areaId]?.name ?? row.areaId }}</div>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200">
            <template #default="{ $index, row }">
              <el-button size="small" @click="() => openItemDetailEditorDialog($index)">
                编辑
              </el-button>
              <el-button
                type="danger"
                plain
                size="small"
                @click="() => removeRow(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
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
~
