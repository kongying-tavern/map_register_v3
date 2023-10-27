<script lang="ts" setup>
import dayjs from 'dayjs'
import type { TableColumnCtx } from 'element-plus'

defineProps<{
  loading: boolean
  data: API.NoticeVo[]
}>()

function datetimeFormatter(row: API.NoticeVo, config: TableColumnCtx<API.NoticeVo>, value: string) {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)
</script>

<template>
  <div ref="tableRef" v-loading="loading" element-loading-text="公告列表加载中..." class="flex-1 overflow-hidden">
    <el-table
      :data="data"
      :border="true"
      :height="height"
    >
      <el-table-column align="center" type="selection" width="50" />
      <el-table-column prop="id" label="ID" :width="100" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="validTimeStart" label="发布时间" :width="180" :formatter="datetimeFormatter" />
      <el-table-column prop="validTimeEnd" label="失效时间" :width="180" :formatter="datetimeFormatter" />
      <el-table-column prop="menu" label="操作" :width="180" header-align="center" />
    </el-table>
  </div>
</template>
