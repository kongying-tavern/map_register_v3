<script lang="ts" setup>
import { DeleteFilled, MapLocation, Plus, QuestionFilled } from '@element-plus/icons-vue'
import { FilterModel } from './FilterModel'
import {
  MapTilePicker,
  ModelItem,
  ModelPicker,
  ModelRow,
  SemanticText,
} from '.'
import { useMapStateStore } from '@/stores'
import { GSButton } from '@/components'

const mapStateStore = useMapStateStore()

/** 筛选预设管理器 */
const {
  copyMAFCache,
  clearMAFCache,
  toggleMAFGroupOperator,
  toggleMAFGroupOpposite,
  appendMAFGroup,
  swapMAFGroup,
  deleteMAFGroup,
  toggleMAFItemOperator,
  toggleMAFItemOpposite,
  appendMAFItem,
  swapMAFItem,
  deleteMAFItem,
} = mapStateStore

// ------------------------------------------------
// 地区底图选择器相关
// ------------------------------------------------
const mapTilePickerVisible = ref(false)

const openMapTilePicker = () => {
  mapTilePickerVisible.value = true
}

// ------------------------------------------------
// 模型选择器相关
// ------------------------------------------------
const modelPickerVisible = ref(false)

const modelPickerGroupIndex = ref(-1)

const openPicker = (groupIndex: number) => {
  modelPickerGroupIndex.value = groupIndex
  modelPickerVisible.value = true
}

const handleModelPickerSelected = (id: number) => {
  if (!Number.isFinite(modelPickerGroupIndex.value) || modelPickerGroupIndex.value <= -1)
    return

  appendMAFItem(modelPickerGroupIndex.value, id)
  modelPickerGroupIndex.value = -1
}
</script>

<template>
  <div class="flex-none flex items-center gap-2 text-white px-2 pb-1 pt-2">
    <!-- 条件列表 -->
    <div class="flex-auto flex gap-1 items-center">
      条件列表
      <el-tooltip placement="top-start" effect="light" content="筛选条件不会即时生效，点击【应用】按钮应用当前筛选条件。">
        <el-icon :size="16">
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </div>
    <div class="flex-none flex gap-1">
      <GSButton
        size="small"
        @click="openMapTilePicker()"
      >
        <template #icon>
          <el-icon color="var(--gs-color-success)">
            <MapLocation />
          </el-icon>
        </template>
        地区
      </GSButton>
      <GSButton
        icon="submit"
        size="small"
        :disabled="mapStateStore.markerAdvancedSame"
        @click="copyMAFCache()"
      >
        应用
      </GSButton>
      <GSButton
        size="small"
        @click="appendMAFGroup()"
      >
        <template #icon>
          <el-icon color="var(--gs-color-cancel)">
            <Plus />
          </el-icon>
        </template>
        新增组
      </GSButton>
    </div>
  </div>
  <div class="flex-3 py-1 overflow-hidden">
    <el-scrollbar class="px-2" height="100%">
      <div class="h-full flex flex-col gap-2">
        <ModelRow
          v-for="(group, groupIndex) in mapStateStore.markerAdvancedComposed"
          :key="groupIndex"
          :composed-condition="group"
          :is-first="groupIndex <= 0"
          :is-last="groupIndex >= mapStateStore.markerAdvancedFilters.length - 1"
          :with-move-up="true"
          :with-move-down="true"
          @switch-operator="() => toggleMAFGroupOperator(groupIndex)"
          @toggle-opposite="() => toggleMAFGroupOpposite(groupIndex)"
          @move-up-group="() => swapMAFGroup(groupIndex, groupIndex - 1)"
          @move-down-group="() => swapMAFGroup(groupIndex, groupIndex + 1)"
          @delete-group="() => deleteMAFGroup(groupIndex)"
          @append-item="() => openPicker(groupIndex)"
        >
          <template #default="{ composedCondition: item, index: itemIndex, size: itemSize }">
            <ModelItem
              :composed-condition="item"
              :is-first="itemIndex <= 0"
              :is-last="itemIndex >= itemSize - 1"
              :with-move-up="true"
              :with-move-down="true"
              @switch-operator="() => toggleMAFItemOperator(groupIndex, itemIndex)"
              @toggle-opposite="() => toggleMAFItemOpposite(groupIndex, itemIndex)"
              @move-up-item="() => swapMAFItem(groupIndex, itemIndex, itemIndex - 1)"
              @move-down-item="() => swapMAFItem(groupIndex, itemIndex, itemIndex + 1)"
              @delete-item="() => deleteMAFItem(groupIndex, itemIndex)"
            >
              <FilterModel
                v-model="item.value"
                :composed-condition="item"
              />
            </ModelItem>
          </template>
        </ModelRow>
      </div>
    </el-scrollbar>
  </div>

  <!-- 条件语义化 -->
  <div class="flex-none px-2 py-1 text-white">
    条件语义化
  </div>
  <div class="py-1 max-h-60">
    <el-scrollbar class="px-2" height="100%">
      <SemanticText />
    </el-scrollbar>
  </div>

  <!-- 底部功能区 -->
  <div class="condition-add-btn flex gap-2 justify-center p-2">
    <slot name="prepend" />
    <GSButton
      class="flex-1"
      size="small"
      :disabled="!mapStateStore.markerAdvancedFilters.length"
      @click="clearMAFCache"
    >
      <template #icon>
        <el-icon color="var(--gs-color-danger)">
          <DeleteFilled />
        </el-icon>
      </template>
      清空条件
    </GSButton>
    <slot name="append" />
  </div>

  <MapTilePicker
    v-model="mapTilePickerVisible"
  />
  <ModelPicker
    v-model="modelPickerVisible"
    @select="handleModelPickerSelected"
  />
</template>
