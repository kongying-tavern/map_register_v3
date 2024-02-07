<script lang="ts" setup>
import { useElementSize } from '@vueuse/core'
import dayjs from 'dayjs'
import type { TableColumnCtx } from 'element-plus'
import { ref } from 'vue'
import type { AnnouncementSearchParams } from '../hooks'
import { channelsMap } from '../const/dictionary'

const props = defineProps<{
  modelValue: AnnouncementSearchParams
  loading: boolean
  data: API.NoticeVo[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v?: AnnouncementSearchParams): void
  (e: 'update', v?: API.NoticeVo): void
  (e: 'remove', v?: API.NoticeVo): void
}>()

const model = <K extends keyof AnnouncementSearchParams>(key: K) => computed({
  get: () => props.modelValue[key],
  set: v => emits('update:modelValue', { ...props.modelValue, [key]: v }),
})

function datetimeFormatter(...{ 2: value = '' }) {
  return value && dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

const contentFormatter = (...{ 2: value = '' }) => {
  const parser = new DOMParser()
  const { firstChild } = parser.parseFromString(value, 'text/html')
  return firstChild instanceof HTMLElement ? (firstChild.textContent ?? '') : ''
}

const getCellClass = (data: {
  column: TableColumnCtx<unknown>
}): string => {
  if (data.column.property === 'content')
    return 'content-cell'

  return ''
}

const sortOrders: ('ascending' | 'descending')[] = ['ascending', 'descending']

const sortOrder = model('sort')

const sortHandler = (data: {
  prop: string
  order: string
}): void => {
  const allowProps: string[] = ['title', 'validTimeStart', 'validTimeEnd']
  const orderTagMap: Record<string, string> = {
    ascending: '+',
    descending: '-',
  }

  if (allowProps.includes(data.prop)) {
    const orderTag = orderTagMap[data.order] || '-'
    const orderStr = `${data.prop}${orderTag}`
    sortOrder.value = [orderStr]
  }
}
</script>

<template>
  <div ref="tableRef" v-loading="loading" element-loading-text="公告列表加载中..." class="flex-1 overflow-hidden">
    <el-table
      :data="data"
      :border="true"
      :height="height"
      :cell-class-name="getCellClass"
      class="table-content"
      :default-sort="{ prop: 'validTimeStart', order: 'descending' }"
      @sort-change="sortHandler"
    >
      <el-table-column align="center" type="selection" :width="50" />

      <el-table-column prop="id" label="ID" :width="80" />

      <el-table-column prop="channel" label="频道" :width="250">
        <template #default="scope">
          <template v-if="scope.row.channel">
            <template v-for="channel in scope.row.channel" :key="channel">
              <el-tag class="mr-1 mb-1">
                {{ channelsMap[channel] }}
              </el-tag>
            </template>
          </template>
        </template>
      </el-table-column>

      <el-table-column
        prop="title"
        label="标题"
        :min-width="100"
        sortable="custom"
        :sort-orders="sortOrders"
      />

      <el-table-column prop="content" label="内容" :min-width="200" :formatter="contentFormatter" />

      <el-table-column
        prop="validTimeStart"
        label="发布时间"
        :width="180"
        :formatter="datetimeFormatter"
        sortable="custom"
        :sort-orders="sortOrders"
      />

      <el-table-column
        prop="validTimeEnd"
        label="失效时间"
        :width="180"
        :formatter="datetimeFormatter"
        sortable="custom"
        :sort-orders="sortOrders"
      />

      <el-table-column prop="menu" label="操作" :width="180" header-align="center" align="center">
        <template #default="scope">
          <el-button text @click="emits('update', scope.row)">
            修改
          </el-button>
          <el-button text @click="emits('remove', scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.table-content :deep(.content-cell .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
