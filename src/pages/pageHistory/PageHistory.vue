<script lang="ts" setup>
import { HistoryTable } from './components'
import { useHistoryList } from './hooks'
import { usePagination } from '@/hooks'

const { pagination, layout, onChange: onPaginationChange } = usePagination()

const HISTORY_OPTIONS = [
  { label: '点位', value: 4 },
  { label: '物品', value: 3 },
]

const HISTORY_TYPE_NAME_MAP = HISTORY_OPTIONS.reduce((map, option) => {
  return map.set(option.value, option.label)
}, new Map<number, string>())

const historyType = ref(4)

const { historyList, userMap, loading, updateHistoryList } = useHistoryList({
  pagination,
  historyType,
})

onPaginationChange(updateHistoryList)
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden p-4">
    <el-form>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
        <el-form-item label="记录项">
          <el-select-v2
            v-model="historyType"
            :options="HISTORY_OPTIONS"
            @change="updateHistoryList"
          />
        </el-form-item>
      </div>
    </el-form>

    <HistoryTable
      :data="historyList"
      :history-name="HISTORY_TYPE_NAME_MAP.get(historyType) ?? '对象'"
      :user-map="userMap"
      :loading="loading"
    />

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :page-sizes="pagination.sizes"
      :pager-count="5"
      :disabled="loading"
      class="flex justify-end items-center"
      background
    />
  </div>
</template>
