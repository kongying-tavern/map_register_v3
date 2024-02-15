<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { DeleteFilled, Plus } from '@element-plus/icons-vue'
import { useMarkerFilter } from './hooks'
import { FilterModel } from './FilterModel'
import {
  ModelItem,
  ModelPicker,
  ModelRow,
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
  <div class="flex-none flex items-center gap-2 text-white p-2 pb-0">
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

  <div class="flex-auto pt-2 pb-0 overflow-hidden">
    <el-scrollbar class="px-2" height="100%">
      <div class="h-full flex flex-col gap-2">
        <ModelRow
          v-for="(group, groupIndex) in markerAdvancedFilters"
          :key="groupIndex"
          :condition="group"
          :with-move-up="groupIndex > 0"
          :with-move-down="groupIndex < markerAdvancedFilters.length - 1"
          @move-up-group="() => swapConditionGroup(groupIndex, groupIndex - 1)"
          @move-down-group="() => swapConditionGroup(groupIndex, groupIndex + 1)"
          @delete-group="() => deleteConditionGroup(groupIndex)"
          @append-item="() => openPicker(groupIndex)"
        >
          <template #default="{ condition: item, index: itemIndex, size: itemSize }">
            <ModelItem
              :with-move-up="itemIndex > 0"
              :with-move-down="itemIndex < itemSize - 1"
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
