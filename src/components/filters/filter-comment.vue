<script setup>
import _ from "lodash";
import {
  filterConfigList,
  filterItemCount,
  filterCardToggle,
} from "./filter-data";
</script>

<template>
  <div class="filter-comment" @click="filterCardToggle()">
    <template v-if="filterItemCount > 0">
      <template v-for="(group, groupIndex) in filterConfigList">
        <div
          v-if="group.filters && _.isArray(group.filters)"
          :key="groupIndex"
          class="filter-group"
          :class="groupIndex % 2 ? 'bg-light-blue-1' : 'bg-orange-1'"
        >
          <span v-if="groupIndex > 0" class="group-joiner">
            {{ group.joinOperator === "|" ? "或" : "且" }}
          </span>
          <span v-if="group.oppositeValue" class="group-opposite">非</span>
          <span class="group-paren">(</span>
          <template v-for="(item, itemIndex) in group.filters">
            <template
              v-if="
                item.filterOpts?.modelSemantic &&
                _.isFunction(item.filterOpts?.modelSemantic) &&
                item.filterOpts?.modelSemantic(
                  item.modelVals,
                  item.filterOpts?.modelOpts,
                  item.oppositeValue
                )
              "
            >
              <span v-if="itemIndex > 0" :key="itemIndex" class="item-joiner">
                {{ item.joinOperator === "|" ? "或" : "且" }}
              </span>
              <span class="item-text" :key="itemIndex">
                {{
                  item.filterOpts?.modelSemantic(
                    item.modelVals,
                    item.filterOpts?.modelOpts,
                    item.oppositeValue
                  )
                }}
              </span>
            </template>
          </template>
          <span class="group-paren">)</span>
        </div>
      </template>
    </template>

    <div v-else class="text-grey-7">无过滤条件</div>
  </div>
</template>

<style lang="scss" scoped>
.filter-comment {
  font-family: monospace;
  overflow-x: hidden;
  overflow-y: auto;
  word-break: break-all;
  max-height: 2.6rem;
  cursor: pointer;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background-color: #ddd;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #a9a9a9;
    border-radius: 4px;
  }
}

.filter-group {
  display: inline;

  .item-text {
    padding: 0 0.2rem;
    border-radius: 0.2rem;
    word-break: break-all;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
