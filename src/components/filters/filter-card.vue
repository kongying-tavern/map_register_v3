<script setup>
import {
  filterCardVisible,
  filterMuteTooltip,
  filterConfigList,
  filterGroupAdd,
  filterGroupDel,
  filterGroupOpposite,
  filterGroupOpToggle,
  filterItemAdd,
  filterItemDel,
  filterItemOpposite,
  filterItemOpToggle,
  filterItemChangeType,
  filterTypes,
  filterConfigSave,
} from "./data";
</script>

<template>
  <q-card
    v-if="filterCardVisible"
    flat
    bordered
    class="filter-card"
    style="margin-top: 0.2rem"
  >
    <div
      v-for="(group, groupIndex) in filterConfigList"
      :key="groupIndex"
      class="filter-group"
      :class="groupIndex % 2 ? 'bg-light-blue-1' : 'bg-orange-1'"
    >
      <!-- 标题行 -->
      <div class="filter-title">
        <q-btn
          style="flex: none; font-weight: bold"
          flat
          dense
          color="purple-6"
          @click="groupIndex > 0 && filterGroupOpToggle(groupIndex)"
        >
          <q-icon
            v-if="groupIndex === 0"
            name="mdi-star-four-points-outline"
            size="1.4rem"
          >
          </q-icon>
          <template v-else-if="group.joinOperator === '&'">
            &nbsp;且&nbsp;
          </template>
          <template v-else>&nbsp;或&nbsp;</template>
          <q-tooltip v-if="!filterMuteTooltip && groupIndex > 0">
            切换 且/或 组合逻辑
          </q-tooltip>
        </q-btn>
        <span class="title">条件组 {{ groupIndex + 1 }}</span>
        <q-btn
          style="flex: none"
          flat
          dense
          color="green-6"
          icon="mdi-filter-plus-outline"
          @click="filterItemAdd(groupIndex)"
        >
          <q-tooltip v-if="!filterMuteTooltip">新增条件</q-tooltip>
        </q-btn>
        <span style="flex: auto">&nbsp;</span>
        <q-btn
          style="flex: none"
          flat
          dense
          :color="group.oppositeValue ? 'red-14' : 'grey-6'"
          :icon="group.oppositeValue ? 'mdi-code-not-equal' : 'mdi-not-equal'"
          @click="filterGroupOpposite(groupIndex)"
        >
          <q-tooltip v-if="!filterMuteTooltip">排除条件组</q-tooltip>
        </q-btn>
        <q-btn
          style="flex: none"
          flat
          dense
          color="blue-7"
          icon="mdi-plus"
          @click="filterGroupAdd(groupIndex)"
        >
          <q-tooltip v-if="!filterMuteTooltip">新增条件组</q-tooltip>
        </q-btn>
        <q-btn
          style="flex: none"
          flat
          dense
          size="md"
          color="red-7"
          icon="mdi-close"
          @click="filterGroupDel(groupIndex)"
        >
          <q-tooltip v-if="!filterMuteTooltip">删除条件组</q-tooltip>
        </q-btn>
      </div>

      <!-- 条件组内容 -->
      <div class="filter-content">
        <div
          v-for="(item, itemIndex) in group.filters"
          :key="itemIndex"
          class="filter-rule"
        >
          <q-btn
            style="flex: none; font-weight: bold"
            flat
            dense
            color="purple-6"
            @click="itemIndex > 0 && filterItemOpToggle(groupIndex, itemIndex)"
          >
            <q-icon
              v-if="itemIndex === 0"
              name="mdi-star-four-points-outline"
              size="1.4rem"
            >
            </q-icon>
            <template v-else-if="item.joinOperator === '&'">
              &nbsp;且&nbsp;
            </template>
            <template v-else>&nbsp;或&nbsp;</template>
            <q-tooltip v-if="!filterMuteTooltip && itemIndex > 0">
              切换 且/或 组合逻辑
            </q-tooltip>
          </q-btn>

          <q-select
            style="flex: none"
            v-model="item.filterOpts"
            borderless
            dense
            hide-dropdown-icon
            hide-bottom-space
            :options="filterTypes"
          >
            <template #selected>
              <q-icon
                v-if="!item.filterOpts.name"
                name="mdi-help"
                size="sm"
                color="grey-8"
              >
              </q-icon>
              <q-icon v-else :name="item.filterOpts.icon" size="sm"> </q-icon>
              <span
                v-if="!item.filterOpts.name"
                style="padding-left: 5px"
                class="grey-8"
              >
                请选择
              </span>
              <span v-else style="padding-left: 5px">
                {{ item.filterOpts.label }}
              </span>
            </template>
            <template #option="scope">
              <div
                style="padding: 5px 10px"
                class="cursor-pointer"
                v-close-popup
                @click="filterItemChangeType(groupIndex, itemIndex, scope.opt)"
              >
                <q-icon :name="scope.opt.icon" size="sm"></q-icon>
                <span style="padding-left: 5px">{{ scope.opt.title }}</span>
              </div>
            </template>
          </q-select>

          <div style="flex: auto; padding: 0 4px">
            <!-- 模型参数配置部分渲染 -->
            <q-input
              v-if="item.model === 'input'"
              v-model="item.modelOpts.text"
              flat
              dense
              @update:model-value="filterConfigSave"
            >
            </q-input>
            <q-toggle
              v-else-if="item.model === 'toggle'"
              v-model="item.modelOpts.value"
              :label="
                item.modelOpts.value
                  ? item.modelOpts.textActive
                  : item.modelOpts.textInactive
              "
              dense
              @update:model-value="filterConfigSave"
            >
            </q-toggle>
          </div>
          <div v-if="item.filterOpts?.filterSlots?.append" style="flex: none">
            <component :is="item.filterOpts?.filterSlots?.append"></component>
          </div>

          <q-btn
            style="flex: none"
            flat
            dense
            :color="item.oppositeValue ? 'red-14' : 'grey-6'"
            :icon="item.oppositeValue ? 'mdi-code-not-equal' : 'mdi-not-equal'"
            @click="filterItemOpposite(groupIndex, itemIndex)"
          >
            <q-tooltip v-if="!filterMuteTooltip">排除条件</q-tooltip>
          </q-btn>
          <q-btn
            style="flex: none"
            flat
            dense
            color="blue-7"
            icon="mdi-plus"
            @click="filterItemAdd(groupIndex, itemIndex)"
          >
            <q-tooltip v-if="!filterMuteTooltip">在下方新增条件</q-tooltip>
          </q-btn>
          <q-btn
            style="flex: none"
            flat
            dense
            size="md"
            color="red-7"
            icon="mdi-close"
            @click="filterItemDel(groupIndex, itemIndex)"
          >
            <q-tooltip v-if="!filterMuteTooltip">删除条件</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </q-card>
</template>

<style lang="scss" scoped>
.filter-card {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  background-color: #fff;
  max-height: 13rem;
  overflow-y: auto;

  .filter-group {
    padding: 8px 10px;

    .filter-title {
      display: flex;
      gap: 3px;

      .title {
        flex: none;
        color: #666;
        font-weight: 600;
        font-size: 1.1rem;
        line-height: 2rem;
        padding-right: 5px;
      }
    }

    .filter-content {
      padding-left: 24px;

      .filter-rule {
        display: flex;
        align-items: center;
        gap: 3px;
      }
    }
  }
}
</style>
