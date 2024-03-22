<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { DeleteFilled, Plus } from '@element-plus/icons-vue'
import { useMarkerFilter } from './hooks'
import { FilterModel } from './FilterModel'
import {
  ModelItem,
  ModelPicker,
  ModelRow,
  SemanticText,
} from '.'
import { GSButton } from '@/components'
import { useMapStateStore } from '@/stores'

const { markerAdvancedFilters } = storeToRefs(useMapStateStore())

/** 筛选预设管理器 */
const {
  appendConditionGroup,
  swapConditionGroup,
  deleteConditionGroup,
  appendCondition,
  swapCondition,
  deleteCondition,
  clearCondition,
} = useMarkerFilter()

// ==================== 物品计数 ====================
const pickerVisible = ref(false)

const pickerGroupIndex = ref(-1)

const openPicker = (groupIndex: number) => {
  pickerGroupIndex.value = groupIndex
  pickerVisible.value = true
}

const handlePickerSelected = (id: number) => {
  if (!Number.isFinite(pickerGroupIndex.value) || pickerGroupIndex.value <= -1)
    return

  appendCondition(pickerGroupIndex.value, id)
  pickerGroupIndex.value = -1
}
</script>

<template>
  <div class="flex-none flex items-center gap-2 text-white px-2 pb-1 pt-2">
    <!-- 条件列表 -->
    <div class="flex-auto">
      条件列表
    </div>
    <div class="flex-none">
      <GSButton
        size="small"
        @click="appendConditionGroup()"
      >
        <template #icon>
          <el-icon color="var(--gs-color-confirm)">
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
          v-for="(group, groupIndex) in markerAdvancedFilters"
          :key="groupIndex"
          :condition="group"
          :is-first="groupIndex <= 0"
          :is-last="groupIndex >= markerAdvancedFilters.length - 1"
          :with-move-up="true"
          :with-move-down="true"
          @switch-operator="() => { group.operator = !group.operator }"
          @toggle-opposite="() => { group.opposite = !group.opposite }"
          @move-up-group="() => swapConditionGroup(groupIndex, groupIndex - 1)"
          @move-down-group="() => swapConditionGroup(groupIndex, groupIndex + 1)"
          @delete-group="() => deleteConditionGroup(groupIndex)"
          @append-item="() => openPicker(groupIndex)"
        >
          <template #default="{ condition: item, index: itemIndex, size: itemSize }">
            <ModelItem
              :is-first="itemIndex <= 0"
              :is-last="itemIndex >= itemSize - 1"
              :with-move-up="true"
              :with-move-down="true"
              @move-up-item="() => swapCondition(groupIndex, itemIndex, itemIndex - 1)"
              @move-down-item="() => swapCondition(groupIndex, itemIndex, itemIndex + 1)"
              @delete-item="() => deleteCondition(groupIndex, itemIndex)"
            >
              <FilterModel
                v-model="item.value"
                :condition="item"
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
      :disabled="!markerAdvancedFilters.length"
      @click="clearCondition"
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

  <ModelPicker
    v-model="pickerVisible"
    @select="handlePickerSelected"
  />
</template>
