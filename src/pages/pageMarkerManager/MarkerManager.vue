<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useSearchMarkerList } from './hooks'

const markerAreasOptions = [
  { label: '蒙德', value: 0 },
  { label: '璃月', value: 1 },
]

const markerTypeOptions = [
  { label: '蒙德', value: 0 },
  { label: '璃月', value: 1 },
]

const markerItemOptions = [
  { label: '蒙德', value: 0 },
  { label: '璃月', value: 1 },
]

const queryForm = reactive<API.MarkerSearchVo & { markerId: number | null }>({
  areaIdList: [],
  itemIdList: [],
  typeIdList: [],
  getBeta: false,
  hiddenFlagList: [],
  markerId: null,
})

const page = ref<number>(1)
const pageSize = ref<number>(10)

const { markerList, totalCount, searchMarkerList } = useSearchMarkerList({
  immediate: false,
  params: () => {
    return {
      areaIdList: queryForm.areaIdList,
      itemIdList: queryForm.itemIdList,
      typeIdList: queryForm.typeIdList,
      getBeta: queryForm.getBeta,
      hiddenFlagList: queryForm.hiddenFlagList,
      markerIdList: queryForm.markerId ? [queryForm.markerId] : [],
      current: page.value,
      size: pageSize.value,
    }
  },
})

function getPageData() {
  searchMarkerList()
}

function positionFormatter(val: string) {
  const [x, y] = val.split(',')
  const numX = Math.floor(parseFloat(x))
  const numY = Math.floor(parseFloat(y))
  return `(${numX}, ${numY})`
}

function onSearch() {
  page.value = 1
}

onMounted(() => {
  getPageData()
})
</script>

<template>
  <el-container>
    <el-header>
      点位管理
    </el-header>
    <el-main>
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="点位id">
          <el-input v-model="queryForm.markerId" placeholder="请输入id" />
        </el-form-item>
        <el-form-item label="地区">
          <el-select
            v-model="queryForm.areaIdList"
            multiple
            placeholder="请选择地区"
            style="width: 240px"
          >
            <el-option
              v-for="item in markerAreasOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="queryForm.typeIdList"
            multiple
            placeholder="请选择点位类型"
            style="width: 240px"
          >
            <el-option
              v-for="item in markerTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物品">
          <el-select
            v-model="queryForm.itemIdList"
            multiple
            placeholder="请选择物品"
            style="width: 240px"
          >
            <el-option
              v-for="item in markerItemOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">
            搜索
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="markerList" border max-height="800">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :fit="false" :data="row.itemList" width="300" border>
              <el-table-column prop="itemId" label="物品id" width="150" />
              <el-table-column prop="iconTag" label="物品标签" width="200" />
              <el-table-column prop="count" label="物品数量" width="150" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="点位id" width="100" />
        <el-table-column prop="markerTitle" label="点位名称" width="200" />
        <el-table-column prop="position" label="点位位置" width="150">
          <template #default="{ row }">
            {{ positionFormatter(row.position) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="点位描述" min-width="200" />
        <el-table-column prop="picture" label="点位图片" width="200">
          <template #default="{ row }">
            <el-link v-if="row.picture" type="primary" :href="row.picture">
              图片链接
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="markerCreatorId" label="点位创建者" width="200" />
        <el-table-column prop="videoPath" label="点位视频" width="200">
          <template #default="{ row }">
            <el-link v-if="row.videoPath" type="primary" :href="row.videoPath">
              视频链接
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="pictureCreatorId" label="点位图片创建者" width="200" />
        <el-table-column prop="refreshTime" label="刷新时间" width="200" />
        <el-table-column prop="hiddenFlag" label="是否隐藏" width="100">
          <template #default="{ row }">
            {{ row.hiddenFlag ? '是' : '否' }}
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          layout="prev, pager, next, sizes, total"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
        />
      </div>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
