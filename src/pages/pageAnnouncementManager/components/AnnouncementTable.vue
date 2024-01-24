<script lang="ts" setup>
import { useElementSize } from '@vueuse/core'
import dayjs from 'dayjs'
import { ref } from 'vue'

defineProps<{
  loading: boolean
  data: API.NoticeVo[]
}>()

const emits = defineEmits<{
  (e: 'update', v?: API.NoticeVo): void
  (e: 'remove', v?: API.NoticeVo): void
}>()

function datetimeFormatter(...{ 2: value = '' }) {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
}

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)

const contentFormatter = (...{ 2: value = '' }) => {
  const parser = new DOMParser()
  const { firstChild } = parser.parseFromString(value, 'text/html')
  return firstChild instanceof HTMLElement ? firstChild.textContent : ''
}
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

      <el-table-column prop="content" label="内容" :formatter="contentFormatter" />

      <el-table-column prop="validTimeStart" label="发布时间" :width="180" :formatter="datetimeFormatter" />

      <el-table-column prop="validTimeEnd" label="失效时间" :width="180" :formatter="datetimeFormatter" />

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
