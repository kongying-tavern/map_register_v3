<script lang="ts" setup>
import { DeleteFilled, MapLocation, Plus, QuestionFilled } from '@element-plus/icons-vue'
import { FilterModel } from './FilterModel'
import {
  MapTilePicker,
  ModelComponent,
  ModelItem,
  ModelPicker,
  SemanticText,
} from '.'
import { useMapStateStore } from '@/stores'
import { AppDraggableTable, GSButton } from '@/components'

const mapStateStore = useMapStateStore()

/** 筛选预设管理器 */
const {
  copyMAFCache,
  clearMAFCache,
  toggleMAFGroupOperator,
  toggleMAFGroupOpposite,
  appendMAFGroup,
  deleteMAFGroup,
  toggleMAFItemOperator,
  toggleMAFItemOpposite,
  appendMAFItem,
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
        地图
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
  <div class="flex-3 py-1 overflow-hidden sort-list">
    <el-scrollbar class="px-2" height="100%">
      <AppDraggableTable
        v-model="mapStateStore.markerAdvancedComposed"
        class="h-full flex flex-col gap-2"
        :get-key="g => g.key"
      >
        <template
          #default="{
            item: group,
            index: groupIndex,
            isGrabbing: isGroupGrabbing,
            isDragging: isGroupDragging,
          }"
        >
          <ModelItem
            class="sort-group"
            :class="{
              'is-grabbing': isGroupGrabbing,
              'is-dragging': isGroupDragging,
            }"
            :composed-condition="group"
            :is-first="groupIndex <= 0"
            :is-last="groupIndex >= mapStateStore.markerAdvancedFilters.length - 1"
            :with-move-up="false"
            :with-move-down="false"
            @switch-operator="() => toggleMAFGroupOperator(groupIndex)"
            @toggle-opposite="() => toggleMAFGroupOpposite(groupIndex)"
            @delete-group="() => deleteMAFGroup(groupIndex)"
            @append-item="() => openPicker(groupIndex)"
          >
            <template
              #default="{
                composedCondition: item,
                index: itemIndex,
                isFirst: isFirstItem,
                isLast: isLastItem,
                isGrabbing: isItemGrabbing,
                isDragging: isItemDragging,
              }"
            >
              <ModelComponent
                class="sort-item"
                :class="{
                  'is-grabbing': isItemGrabbing,
                  'is-dragging': isItemDragging,
                }"
                :composed-condition="item"
                :is-first="isFirstItem"
                :is-last="isLastItem"
                :with-move-up="false"
                :with-move-down="false"
                @switch-operator="() => toggleMAFItemOperator(groupIndex, itemIndex)"
                @toggle-opposite="() => toggleMAFItemOpposite(groupIndex, itemIndex)"
                @delete-item="() => deleteMAFItem(groupIndex, itemIndex)"
              >
                <FilterModel
                  v-model="item.value"
                  :composed-condition="item"
                />
              </ModelComponent>
            </template>
          </ModelItem>
        </template>
      </AppDraggableTable>
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

<style lang="scss" scoped>
.sort-list {
  :deep(.sort-group) {
    position: relative;
    &:not(.is-dragging) {
      cursor: pointer;
    }

    --border-color: transparent;
    &:not(.is-dragging):hover {
      --border-color: var(--gs-color-cancel);
    }
    &:not(.is-dragging):active {
      --border-color: transparent;
    }
    &.is-grabbing {
      --border-color: var(--gs-color-confirm);
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 3px solid var(--border-color);
      border-radius: 1rem;
    }
  }

  // TODO: 后续优化拖动样式
  :deep(.sort-item) {
    &:not(.is-dragging):hover {
      background: orange;
    }
    &:not(.is-dragging):active {
      background: black;
    }
    &.is-grabbing {
      background: blue;
    }
  }
}
</style>
