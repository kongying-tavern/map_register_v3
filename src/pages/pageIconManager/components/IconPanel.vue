<script lang="ts" setup>
import Api from '@/api/api'
import { PgUnit, useFetchHook, usePagination } from '@/hooks'
import { Logger } from '@/utils'

const logger = new Logger('[icon]')

const iconList = ref<API.IconVo[]>([])

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.SIZE],
})

const { refresh, onSuccess } = useFetchHook({
  onRequest: async () => {
    const { current, pageSize } = pagination.value
    const { data: { record = [], total = 0 } = {} } = await Api.icon.listIcon({
      size: pageSize,
      current,
    })
    return { record, total }
  },
})

onMounted(refresh)

onSuccess(({ record, total }) => {
  iconList.value = record
  pagination.value.total = total
  logger.info(record)
})

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const urlFormatter = (_: unknown, __: unknown, url = '') => {
  return decodeURIComponent(url)
}
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="border p-2">
      筛选栏
    </div>

    <div ref="tableContainerRef" class="flex-1">
      <el-table
        :data="iconList"
        :max-height="height"
        :height="height"
        :border="true"
        cell-class-name="whitespace-nowrap"
        style="width: 100%"
      >
        <el-table-column prop="iconId" label="id" width="150px" />
        <el-table-column prop="name" label="名称" width="150px" />
        <el-table-column prop="typeIdList" label="类型" width="150px" />
        <el-table-column prop="creator" label="创建者" width="150px" />
        <el-table-column prop="url" label="url" min-width="400px" :formatter="urlFormatter" />
        <el-table-column label="操作" width="100px">
          <el-button size="small">
            编辑
          </el-button>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :layout="layout"
      :pager-count="5"
      :page-sizes="[10, 15, 20, 25, 30]"
      background
      @current-change="refresh"
      @size-change="refresh"
    />
  </div>
</template>
