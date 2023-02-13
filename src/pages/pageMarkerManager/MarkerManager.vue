<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useMarkerList } from './hooks'

const queryForm = reactive<API.MarkerSearchVo>({
  areaIdList: [],
  itemIdList: [],
  typeIdList: [],
  getBeta: false,
  hiddenFlagList: [],
})

const page = ref<number>(1)
const pageSize = ref<number>(10)
const { markerList, totalCount, updateMarkerList } = useMarkerList({
  immediate: true,
  params: () => {
    return {
      current: page.value,
      size: pageSize.value,
    }
  },
})

function getPageData() {
  updateMarkerList()
}

function positionFormatter(val: string) {
  const [x, y] = val.split(',')
  const numX = Math.floor(parseFloat(x))
  const numY = Math.floor(parseFloat(y))
  return `(${numX}, ${numY})`
}

function handlePageSizeChange(val: number) {
  pageSize.value = val
  getPageData()
}

function handleCurrentPageChange(val: number) {
  page.value = val
  getPageData()
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
          layout="prev, pager, next, sizes, total"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="page"
          :page-size="pageSize"
          :total="totalCount"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange"
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
