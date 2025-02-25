<script setup lang="ts">
import type { PaginationState } from '@/hooks'
import { AppDropdown } from '@/components'
import { NOTICE_NAME_MAP } from '@/shared'
import { CirclePlus, Filter, Search, Sort } from '@element-plus/icons-vue'
import ListSorter from './ListSorter.vue'

const emits = defineEmits<{
  change: []
  create: []
}>()

const filterParams = defineModel<Omit<API.NoticeSearchVo, 'current' | 'size'>>('modelValue', {
  required: true,
})

const pagination = defineModel<PaginationState>('pagination', {
  required: true,
})

const resetCurrentAndChange = () => {
  pagination.value.current = 1
  emits('change')
}

const options = [...NOTICE_NAME_MAP.entries()]

const sortableKeyOptions: { label: string, key: string }[] = [
  { label: '标题', key: 'title' },
  { label: '有效性', key: 'isValid' },
  { label: '有效起始时间', key: 'validTimeStart' },
  { label: '有效截止时间', key: 'validTimeEnd' },
  { label: '更新时间', key: 'updateTime' },
  { label: '排序权重', key: 'sortIndex' },
]

const dropdownKey = ref('')

const sortRef = ref<InstanceType<typeof AppDropdown>>()

const handleSortChange = () => {
  sortRef.value?.close()
  resetCurrentAndChange()
}

const handleSortChangeCancel = () => {
  sortRef.value?.close()
}
</script>

<template>
  <div
    class="
      flex justify-end items-center p-2
      border-b-[1px] border-[var(--el-border-color-lighter)]
      overflow-auto
    "
  >
    <el-input
      v-model="filterParams.title"
      :prefix-icon="Search"
      clearable
      placeholder="搜索公告名称..."
      class="max-w-[300px]"
      @change="resetCurrentAndChange"
    />

    <el-divider direction="vertical" />

    <AppDropdown v-model="dropdownKey" dropdown-key="filter" :icon="Filter">
      <template #default>
        过滤
      </template>

      <template #dropdown>
        <div>
          <div class="pt-1 px-2 font-bold">
            状态
          </div>

          <el-checkbox
            v-model="filterParams.getValid"
            :false-value="undefined"
            class="px-2"
            @change="resetCurrentAndChange"
          >
            只看生效公告
          </el-checkbox>

          <el-divider style="margin: 6px 0;" />

          <div class="pt-1 px-2 font-bold">
            频道
          </div>

          <el-checkbox-group
            v-model="filterParams.channels"
            class="px-2 flex flex-col"
            @change="resetCurrentAndChange"
          >
            <el-checkbox v-for="([value, name]) in options" :key="value" :value="value">
              {{ name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
    </AppDropdown>

    <el-divider direction="vertical" />

    <AppDropdown ref="sortRef" v-model="dropdownKey" dropdown-key="sort" :icon="Sort">
      <template #default>
        排序
      </template>

      <template #dropdown>
        <ListSorter
          v-model="filterParams.sort"
          :visible="dropdownKey === 'sort'"
          :options="sortableKeyOptions"
          @change="handleSortChange"
          @cancel="handleSortChangeCancel"
        />
      </template>
    </AppDropdown>

    <el-divider direction="vertical" />

    <el-button text :icon="CirclePlus" @click="() => $emit('create')">
      新增
    </el-button>
  </div>
</template>
