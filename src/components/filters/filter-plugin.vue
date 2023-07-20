<script setup>
import { ref } from "vue";
import {
  filterConfigList,
  filterGroupAdd,
  filterGroupDel,
  filterGroupOpposite,
  filterGroupOpToggle,
  filterItemAdd,
  filterItemOpposite,
  filterItemOpToggle,
  filterItemChangeType,
  filterTypes,
} from "./data";
import { filterItemDel } from "./data";
import FilterComment from "./filter-comment.vue";

const expanded = ref(false);

const muteTooltip = ref(false);
</script>

<template>
  <div class="relative-position">
    <!-- 内容区 -->
    <div class="wrapper">
      <q-icon
        class="cursor-pointer"
        style="flex: none"
        size="md"
        name="mdi-filter-outline"
        @click="expanded = !expanded"
      >
      </q-icon>
      <FilterComment style="flex: auto"></FilterComment>
      <q-btn
        style="flex: none"
        unelevated
        rounded
        dense
        size="md"
        :color="muteTooltip ? 'grey-1' : 'pink-4'"
        :text-color="muteTooltip ? 'pink-4' : 'grey-1'"
        :icon="muteTooltip ? 'mdi-tooltip-outline' : 'mdi-tooltip-text-outline'"
        @click="muteTooltip = !muteTooltip"
      >
        <q-tooltip>
          <template v-if="muteTooltip">开启筛选按钮提示</template>
          <template v-else>关闭筛选按钮提示</template>
        </q-tooltip>
      </q-btn>
    </div>

    <!-- 筛选条件弹出框 -->
    <transition
      appear
      enter-active-class="animated fadeInLeft"
      leave-active-class="animated fadeOutLeft"
    >
      <q-card v-if="expanded" flat bordered class="filter-card">
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
              <q-tooltip v-if="!muteTooltip && groupIndex > 0">
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
              <q-tooltip v-if="!muteTooltip">新增条件</q-tooltip>
            </q-btn>
            <span style="flex: auto">&nbsp;</span>
            <q-btn
              style="flex: none"
              flat
              dense
              :color="group.oppositeValue ? 'red-14' : 'grey-6'"
              :icon="
                group.oppositeValue ? 'mdi-code-not-equal' : 'mdi-not-equal'
              "
              @click="filterGroupOpposite(groupIndex)"
            >
              <q-tooltip v-if="!muteTooltip">排除条件组</q-tooltip>
            </q-btn>
            <q-btn
              style="flex: none"
              flat
              dense
              color="blue-7"
              icon="mdi-plus"
              @click="filterGroupAdd(groupIndex)"
            >
              <q-tooltip v-if="!muteTooltip">新增条件组</q-tooltip>
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
              <q-tooltip v-if="!muteTooltip">删除条件组</q-tooltip>
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
                @click="
                  itemIndex > 0 && filterItemOpToggle(groupIndex, itemIndex)
                "
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
                <q-tooltip v-if="!muteTooltip && itemIndex > 0">
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
                  <q-icon v-else :name="item.filterOpts.icon" size="sm">
                  </q-icon>
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
                    @click="
                      filterItemChangeType(groupIndex, itemIndex, scope.opt)
                    "
                  >
                    <q-icon :name="scope.opt.icon" size="sm"></q-icon>
                    <span style="padding-left: 5px">{{ scope.opt.title }}</span>
                  </div>
                </template>
              </q-select>

              <div style="flex: auto; padding: 0 4px">
                <q-input
                  v-if="item.model === 'input'"
                  v-model="item.modelOpts.text"
                  flat
                  dense
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
                >
                </q-toggle>
              </div>
              <q-btn
                style="flex: none"
                flat
                dense
                :color="item.oppositeValue ? 'red-14' : 'grey-6'"
                :icon="
                  item.oppositeValue ? 'mdi-code-not-equal' : 'mdi-not-equal'
                "
                @click="filterItemOpposite(groupIndex, itemIndex)"
              >
                <q-tooltip v-if="!muteTooltip">排除条件</q-tooltip>
              </q-btn>
              <q-btn
                style="flex: none"
                flat
                dense
                color="blue-7"
                icon="mdi-plus"
                @click="filterItemAdd(groupIndex, itemIndex)"
              >
                <q-tooltip v-if="!muteTooltip">在下方新增条件</q-tooltip>
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
                <q-tooltip v-if="!muteTooltip">删除条件</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  overflow: visible;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-card {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  padding: 0;
  position: absolute;
  inset: auto 0;
  background-color: #fff;
  z-index: 1000;
  max-height: 18rem;
  width: 160%;
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
