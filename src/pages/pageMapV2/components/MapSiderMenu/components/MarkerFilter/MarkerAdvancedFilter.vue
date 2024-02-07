<script lang="ts" setup>
import { DeleteFilled, Plus } from '@element-plus/icons-vue'
import { useMarkerFilterAdvanced } from './hooks'
import { ConditionAdvancedItem, ConditionAdvancedModel, ConditionAdvancedRow } from '.'
import { GSButton } from '@/components'

/** 筛选预设管理器 */
const {
  conditions,

  appendConditionGroup,
  swapConditionGroup,
  deleteConditionGroup,
  appendCondition,
  swapCondition,
  deleteCondition,
  clearCondition,
} = useMarkerFilterAdvanced()
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
        <ConditionAdvancedRow
          v-for="(group, groupIndex) in conditions"
          :key="groupIndex"
          :condition="group"
          :with-move-up="groupIndex > 0"
          :with-move-down="groupIndex < conditions.length - 1"
          @move-up-group="() => swapConditionGroup(groupIndex, groupIndex - 1)"
          @move-down-group="() => swapConditionGroup(groupIndex, groupIndex + 1)"
          @delete-group="() => deleteConditionGroup(groupIndex)"
          @append-item="() => appendCondition(groupIndex)"
        >
          <template #default="{ condition: item, index: itemIndex, size: itemSize }">
            <ConditionAdvancedItem
              :with-move-up="itemIndex > 0"
              :with-move-down="itemIndex < itemSize - 1"
              @move-up-item="() => swapCondition(groupIndex, itemIndex, itemIndex - 1)"
              @move-down-item="() => swapCondition(groupIndex, itemIndex, itemIndex + 1)"
              @delete-item="() => deleteCondition(groupIndex, itemIndex)"
            >
              <ConditionAdvancedModel :condition="item" />
            </ConditionAdvancedItem>
          </template>
        </ConditionAdvancedRow>
      </div>
    </el-scrollbar>
  </div>

  <div class="condition-add-btn flex gap-2 justify-center p-2">
    <slot name="prepend" />
    <GSButton
      class="flex-1"
      size="small"
      :disabled="!conditions.length"
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
</template>
