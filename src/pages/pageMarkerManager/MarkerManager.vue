<template>
  <el-container>
    <el-header>
      点位管理
    </el-header>
    <el-main>
      <el-table :data="tableData" border max-height="800">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :fit="false" :data="row.itemList" width="300" border>
              <el-table-column prop="itemId" label="物品id" width="50" />
              <el-table-column prop="iconTag" label="物品标签" width="200" />
              <el-table-column prop="count" label="物品数量" width="50" />
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
            <el-link v-if="row.picture" type="primary" :href="row.picture">图片链接</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="markerCreatorId" label="点位创建者" width="200" />
        <el-table-column prop="videoPath" label="点位视频" width="200">
          <template #default="{ row }">
            <el-link v-if="row.videoPath" type="primary" :href="row.videoPath">视频链接</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="pictureCreatorId" label="点位图片创建者" width="200" />
        <el-table-column prop="refreshTime" label="刷新时间" width="200" />
        <el-table-column prop="hiddenFlag" label="是否隐藏" width="100">
          <template #default="{ row }">
            {{ row.hiddenFlag? '是' : '否' }}
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
          <el-pagination
          layout="prev, pager, next, sizes, total"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange"
        />
      </div>
      
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue';
import { listMarkerPage } from '@/api/api/marker';
import { ElMessage } from 'element-plus'

const queryForm = reactive<API.MarkerSearchVo>({
  areaIdList: [],
  itemIdList: [],
  typeIdList: [],
  getBeta: false,
  hiddenFlagList: [],
});

const tableData = ref<API.MarkerVo[]>([]);
const page = ref<number>(1);
const pageSize = ref<number>(10);
const total = ref<number>(0);

/** 通用错误处理 */
const commonErrorHandler = (err: Error) => ElMessage.error(err.message)

function getPageData() {
  listMarkerPage({}, { current: page.value, size: pageSize.value }).then(res => {
    if (res.errorStatus === 200) {
      tableData.value = res.data?.record || [];
      total.value = res.data?.total || 0;
    } else {
      commonErrorHandler(new Error(res.message));
    }
  })
}

function positionFormatter(val: string) {
  const [x,y] = val.split(',');
  const numX = Math.floor(parseFloat(x));
  const numY = Math.floor(parseFloat(y));
  return `(${numX}, ${numY})`;
}

function handlePageSizeChange(val: number) {
  pageSize.value = val;
  getPageData();
}

function handleCurrentPageChange(val: number) {
  page.value = val;
  getPageData();
}

onMounted(() => {
  getPageData();
})
</script>

<style lang="scss" scoped>
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>