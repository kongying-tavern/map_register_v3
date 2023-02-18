<script lang="tsx" setup>
import type { Ref } from 'vue'
import { useCommonItemDelete, useCommonItemList, useItemCreate } from './hooks'
import { PgUnit, useAreaList, useIconList, usePagination, useTypeList } from '@/hooks'

const { pagination, layout } = usePagination({
  units: [PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})
const checkedArea = ref<API.AreaVo>()
const checkedType = ref<API.ItemTypeVo>()

const { areaMap, areaTree, loading: areaLoading, areaList } = useAreaList({
  immediate: true,
})

const { iconMap, iconList } = useIconList({ immediate: true })

const { typeTree, loading: typeLoading } = useTypeList({ immediate: true })

const searchInput = ref('')

const { itemList, loading: itemLoading, onSuccess: onItemListFetched, pause, resume, updateItemList } = useCommonItemList({
  immediate: true,
  params: () => ({
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
  if (!area.isFinal)
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
  pagination.value.total = total
})

const onCreateItemSuccess = () => {
  updateItemList()
}

const { openItemCreatorDialog } = useItemCreate({
  defaultItemData: () => ({
    areaId: checkedArea.value?.areaId,
    typeIdList: checkedType.value ? [checkedType.value.typeId as number] : [],
  }),
})

const containerRef = ref<HTMLElement | null>(null)
const { height, width } = useElementSize(containerRef)

const selection = ref<API.ItemVo[]>([])
const removeOneItem = ref<API.ItemVo[]>([])

const getDeleteParams = () => {
  const transform = (items: Ref<API.ItemVo[]>) => items.value.map(item => item.itemId ?? -1).filter(id => id !== -1)
  if (removeOneItem.value.length)
    return transform(removeOneItem)
  return transform(selection)
}

const { refresh: deleteCommonItem, onSuccess: onDeleteCommonItemSuccess, loading: removeLoading } = useCommonItemDelete({
  params: getDeleteParams,
})

onDeleteCommonItemSuccess(() => {
  removeOneItem.value = []
  updateItemList()
})
</script>

<template>
  <div class="h-full flex gap-2">
    <div class="h-full w-40 flex flex-col gap-2 overflow-hidden">
      <div>地区</div>
      <el-tree
        v-loading="true"
        element-loading-text="未完工"
        element-loading-spinner="none"
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
        v-loading="true"
        element-loading-text="未完工"
        element-loading-spinner="none"
        :data="typeTree"
        :props="{ label: 'name', isLeaf: 'isLeaf' }"
        class="flex-1 overflow-auto"
        accordion
        node-key="typeId"
        highlight-current
        @current-change="onTypeCheckedChange"
      />
      <!-- <div>地区</div>
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
      /> -->
    </div>

    <div class="h-full flex-1 flex flex-col gap-2 overflow-hidden">
      <div class="flex gap-2">
        <!-- <div v-show="!checkedArea && !checkedType">
          选择地区或类型
        </div>
        <div v-show="checkedArea">
          {{ checkedArea?.name }}
        </div>
        <div v-show="checkedType">
          {{ checkedType?.name }}
        </div> -->
      </div>
      <div class="flex items-center justify-end gap-2">
        <!-- TODO 搜索框 -->
        <el-input
          v-model="searchInput"
          disabled
          placeholder="搜索……（未完工）"
          clearable
          class="flex-grow max-w-xs ml-0 mr-auto"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <search />
            </el-icon>
          </template>
        </el-input>
        <div class="text-sm">
          {{ selection.length ? `已选${selection.length}个物品` : '' }}
        </div>
        <el-button
          type="danger"
          plain
          :loading="removeLoading"
          :disabled="!selection.length"
          @click="deleteCommonItem"
        >
          批量移除
        </el-button>
        <el-button
          type="primary"
          @click="() => {
            openItemCreatorDialog({
              props: {
                iconList,
                areaList,
                iconMap,
              },
              listeners: {
                success: onCreateItemSuccess,
              },
            })
          }"
        >
          批量添加
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
          <el-table-column label="图标" width="57">
            <template #default="{ row }">
              <img
                class="w-8 h-8 object-contain rounded-full bg-slate-700"
                :src="iconMap[row.iconTag ?? '']"
                referrerpolicy="no-referrer"
              >
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="name" width="200" />
          <el-table-column label="地区" width="200">
            <template #default="{ row }">
              <div>{{ areaMap[row.areaId]?.name ?? row.areaId }}</div>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="73">
            <template #default="{ row }">
              <el-button
                type="danger"
                plain
                size="small"
                @click="() => {
                  removeOneItem = [row]
                  deleteCommonItem()
                }"
              >
                移除
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
