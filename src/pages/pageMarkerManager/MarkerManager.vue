<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useArea, useItemList, useItemType, useSearchMarkerList, useUpdateMarker } from './hooks'

const queryForm = reactive<API.MarkerSearchVo & { markerId: number | null }>({
  areaIdList: [],
  itemIdList: [],
  typeIdList: [],
  getBeta: false,
  hiddenFlagList: [],
  markerId: null,
})

const editForm = reactive<{
  ids: number[]
  refreshTime?: number
  content?: string
  hiddenFlag?: number
}>({
  ids: [],
  refreshTime: undefined,
  content: undefined,
  hiddenFlag: undefined,
})

const page = ref<number>(1)
const pageSize = ref<number>(20)
const multipleSelection = ref<API.MarkerVo[]>([])
const multipleEditDialogVisible = ref<boolean>(false)

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

const { updateMarkerInfo } = useUpdateMarker({
  immediate: false,
  params: () => {
    return {
      ids: editForm.ids,
      refreshTime: editForm.refreshTime?.valueOf() || undefined,
      content: editForm.content,
      hiddenFlag: editForm.hiddenFlag,
    }
  },
  callback: () => {
    getPageData()
  },
})

const { areaList: markerAreasOptions, getArea } = useArea()
const { itemTypeList: markerTypeOptions, getItemType } = useItemType()
const { itemList: markerItemOptions, getItemList } = useItemList({
  params: () => {
    return {
      current: 0,
      size: 2000,
      typeIdList: [],
      areaIdList: [],
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
  getPageData()
}

function handleSelectionChange(val: API.MarkerVo[]) {
  multipleSelection.value = val
}

function openMultipleEditor() {
  editForm.ids = multipleSelection.value.map(el => el.id || 0)
  editForm.content = undefined
  editForm.hiddenFlag = undefined
  editForm.refreshTime = undefined
  multipleEditDialogVisible.value = true
}

function multipleEdit() {
  submitEdit()
}

function submitEdit() {
  updateMarkerInfo()
}

onMounted(() => {
  getPageData()
  getArea()
  getItemType()
  getItemList()
})
</script>

<template>
  <el-container>
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
          <el-button :disabled="!multipleSelection.length" @click="openMultipleEditor">
            批量修改
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="markerList" border max-height="1000" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="点位id" width="100" />
        <el-table-column prop="markerTitle" label="点位名称" width="200" />
        <el-table-column prop="position" label="点位位置" width="150">
          <template #default="{ row }">
            {{ positionFormatter(row.position) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="点位描述" min-width="200" show-overflow-tooltip />
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
      <el-dialog
        v-model="multipleEditDialogVisible"
        title="批量编辑"
        width="50%"
      >
        <div class="multiple-editor-container">
          <el-form :model="editForm">
            <el-form-item label="点位id">
              <span>{{ editForm.ids.join(',') }}</span>
            </el-form-item>
            <el-form-item label="点位内容">
              <el-input
                v-model="editForm.content"
                type="textarea"
              />
            </el-form-item>
            <el-form-item label="刷新时间">
              <el-date-picker
                v-model="editForm.refreshTime"
                type="datetime"
                placeholder="选择刷新时间"
              />
            </el-form-item>
            <el-form-item label="是否隐藏">
              <el-switch
                v-model="editForm.hiddenFlag"
                inline-prompt
                active-text="是"
                inactive-text="否"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-form>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="multipleEditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="multipleEdit">
              提交
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.multiple-editor-container {
  padding: 20px;
}
</style>
