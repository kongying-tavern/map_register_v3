<script lang="ts" setup>
import dayjs from 'dayjs'
import { Delete, Edit } from '@element-plus/icons-vue'
import type { AnnouncementSearchParams } from '../hooks'
import { channelsMap } from '../const/dictionary'

// import { secondClock } from '@/shared'

const props = defineProps<{
  loading: boolean
  data: API.NoticeVo[]
}>()

const emits = defineEmits<{
  update: [v?: API.NoticeVo]
  remove: [v?: API.NoticeVo]
  sortChange: []
}>()

const modelValue = defineModel<AnnouncementSearchParams>({
  required: true,
})

const covertNoticeList = computed(() => props.data.map(notice => ({
  ...notice,
  time: {
    start: notice.validTimeStart ? new Date(notice.validTimeStart).getTime() : undefined,
    end: notice.validTimeEnd ? new Date(notice.validTimeEnd).getTime() : undefined,
  },
})))

function datetimeFormatter(...{ 2: value = '' }) {
  return value && dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const isValid = (notice: (typeof covertNoticeList)['value'][number]) => {
  const now = Date.now()
  const { start, end } = notice.time
  if (start && now < start)
    return false
  if (end && now > end)
    return false
  return true
}

const validList = computed(() => covertNoticeList.value.map(notice => isValid(notice)))

const getCellClassName = (cell: { column: { property?: string }; row: (typeof covertNoticeList)['value'][number] }) => {
  if (cell.column.property !== 'title')
    return ''
  if (isValid(cell.row))
    return 'is-title'
  return 'is-invalid'
}

const contentFormatter = (...{ 2: value = '' }) => {
  const parser = new DOMParser()
  const { firstChild } = parser.parseFromString(value, 'text/html')
  const content = firstChild instanceof HTMLElement ? (firstChild.textContent ?? '') : ''
  return content.length > 50 ? `${content.slice(0, 50)}...` : content
}

const orderTagMap: Record<string, string> = {
  ascending: '+',
  descending: '-',
}

const sortOrders = ['ascending' as const, 'descending' as const]

const sortHandler = ({ prop, order }: { prop: string; order: string }): void => {
  modelValue.value = {
    ...modelValue.value,
    sort: [`${prop}${orderTagMap[order] ?? '-'}`],
  }
  emits('sortChange')
}
</script>

<template>
  <div v-loading="loading" element-loading-text="公告列表加载中..." class="flex-1 overflow-hidden">
    <el-table
      :data="covertNoticeList"
      :border="true"
      height="100%"
      :default-sort="{ prop: 'validTimeStart', order: 'descending' }"
      :cell-class-name="getCellClassName"
      class="notice-table"
      @sort-change="sortHandler"
    >
      <el-table-column align="center" type="selection" :width="50" />

      <el-table-column prop="id" label="ID" :width="70" />

      <el-table-column label="状态" :width="70">
        <template #default="{ $index }">
          <el-tag v-if="validList[$index]" type="success">
            有效
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="title"
        label="标题"
        :min-width="200"
        show-overflow-tooltip
        sortable="custom"
        :sort-orders="sortOrders"
      />

      <el-table-column
        prop="content"
        label="内容"
        show-overflow-tooltip
        :width="200"
        :formatter="contentFormatter"
      />

      <el-table-column prop="channel" label="频道" :width="180">
        <template #default="{ row }">
          <div v-if="row.channel?.length" class="flex flex-wrap gap-1">
            <el-tag v-for="channel in row.channel" :key="channel">
              {{ channelsMap[channel] }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="validTimeStart"
        label="发布时间"
        :width="170"
        :formatter="datetimeFormatter"
        sortable="custom"
        :sort-orders="sortOrders"
      />

      <el-table-column
        prop="validTimeEnd"
        label="失效时间"
        :width="170"
        :formatter="datetimeFormatter"
        sortable="custom"
        :sort-orders="sortOrders"
      />

      <el-table-column prop="menu" label="操作" :width="130" header-align="center" align="center">
        <template #default="scope">
          <el-button plain :icon="Edit" @click="emits('update', scope.row)" />
          <el-button plain :icon="Delete" type="danger" @click="emits('remove', scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.notice-table {
  :deep(.el-table__cell) {
    padding: 8px 0;
    &.is-title {
      color: var(--el-color-primary);
    }
    &.is-invalid {
      color: var(--el-color-info-light-3);
    }
  }
}
</style>
