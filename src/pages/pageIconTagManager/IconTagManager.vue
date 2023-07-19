<script lang="ts" setup>
import { Delete, Edit } from '@element-plus/icons-vue'
import { useIconTagList } from './hooks'
import { IconTagFilter, IconTagTable } from './components'
import { PgUnit, usePagination } from '@/hooks'

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.SIZE, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT],
})

const selections = ref<API.TagVo[]>([])

const filterForm = ref({
  typeIdList: [] as number[],
  tagList: [] as string[],
})

const { iconTagList, userMap, loading, updateTagLIst } = useIconTagList({
  pagination,
  getParams: () => filterForm.value,
})

const placeholder = (row: unknown) => {
  console.log('[action]', toValue(row))
}
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <IconTagFilter v-model="filterForm">
      <template #footer>
        <div class="w-full flex items-center justify-end">
          <el-button type="danger" :disabled="!selections.length">
            批量删除 {{ selections.length ? ` ${selections.length} 项` : '' }}
          </el-button>
          <el-button type="primary">
            添加标签
          </el-button>
        </div>
      </template>
    </IconTagFilter>

    <IconTagTable
      v-model:selections="selections"
      :icon-tag-list="iconTagList"
      :user-map="userMap"
      :loading="loading"
    >
      <template #action="{ row }">
        <el-button :icon="Edit" @click="() => placeholder(row)" />
        <el-button type="danger" plain :icon="Delete" @click="() => placeholder(row)" />
      </template>
    </IconTagTable>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :disabled="loading"
      :total="pagination.total"
      :layout="layout"
      :pager-count="5"
      :page-sizes="[10, 20, 30]"
      background
      class="flex justify-end items-center"
      @current-change="updateTagLIst"
      @size-change="updateTagLIst"
    />
  </div>
</template>
