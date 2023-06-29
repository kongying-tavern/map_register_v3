<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useIconWithName } from '../hooks'
import Api from '@/api/api'
import { PgUnit, useFetchHook, usePagination } from '@/hooks'
import { Logger } from '@/utils'

const logger = new Logger('[icon]')

const iconList = ref<API.IconVo[]>([])
const selectedType = ref<number>(-1)

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.SIZE],
})

const error = (err: Error) => {
  logger.error(err)
  ElMessage.error(err.message)
}

// 图标类型
const iconTypeList = ref<API.IconTypeVo[]>([])
const iconTypeMap = ref<Record<number, string>>({})

const { refresh: typeRefresh, onSuccess: onTypeSuccess, onError: onTypeError } = useFetchHook({
  onRequest: async () => {
    const { data: { record = [] } = {} } = await Api.iconType.listIconType({
      size: 100,
      current: 1,
      typeIdList: [-1],
    })
    record.forEach((item) => {
      iconTypeMap.value[item.id!] = item.name || ''
    })
    return record
  },
})

onMounted(typeRefresh)

onTypeSuccess((record) => {
  iconTypeList.value = record
  iconTypeList.value.unshift({
    version: 1,
    id: -1,
    updaterId: 1,
    updateTime: '',
    name: '全部',
    parent: -1,
    isFinal: false,
  })
})

onTypeError(error)

// 图标列表
const { refresh, onSuccess, onError } = useIconWithName({ pagination, selectedType })

onMounted(refresh)

onSuccess(({ record, total }) => {
  iconList.value = record
  pagination.value.total = total
})

onError(error)

watch(selectedType, () => {
  refresh()
  pagination.value.current = 1
})

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const urlFormatter = (_: unknown, __: unknown, url = '') => {
  return decodeURIComponent(url)
}
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden">
    <div class="py-1">
      <!-- 根据图标类型筛选 -->
      图标类型:
      <el-select v-model="selectedType" placeholder="请选择图标类型">
        <el-option
          v-for="item in iconTypeList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
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
        <el-table-column label="图标" min-width="50px">
          <template #default="scope">
            <img
              v-if="scope.row.url"
              :src="scope.row.url"
              style="width: 30px; height: 30px; object-fit: contain"
            >
          </template>
        </el-table-column>
        <el-table-column prop="id" label="id" width="100px" />
        <el-table-column prop="name" label="名称" width="150px" />
        <!-- <el-table-column prop="typeIdList" label="图标类型" width="150px" /> -->
        <el-table-column label="图标类型" min-width="100px">
          <template #default="scope">
            <span>{{ iconTypeMap[scope.row.typeIdList[0]] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updaterName" label="提交者" width="150px" />
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
      :pager-count="7"
      :page-sizes="[10, 15, 30]"
      background
      @current-change="refresh"
      @size-change="refresh"
    />
  </div>
</template>
