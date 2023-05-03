<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useItemList, useItemType, useMarkerBatchUpdate, useSearchMarkerList } from './hooks'
import { PgUnit, useAreaList, usePagination } from '@/hooks'
import { HiddenFlagEnum } from '@/shared'

// ==================== 搜索 ====================
const queryForm = reactive<Required<API.MarkerSearchVo & { markerIds: string }>>({
  areaIdList: [],
  itemIdList: [],
  typeIdList: [],
  getBeta: false,
  hiddenFlagList: [],
  markerIds: '',
})

const queryMarkerIdList = computed(() => [...new Set(queryForm.markerIds
  .split(',')
  .map(c => parseInt(c.trim()))
  .filter(n => !isNaN(n)),
)])
// ==================== 批量编辑 ====================
const multipleEditDialogVisible = ref<boolean>(false)

const editForm = reactive({
  ids: [] as number[],
  refreshTime: 0,
  content: '',
  hiddenFlag: HiddenFlagEnum.SHOW,
})

const resetEditForm = () => {
  editForm.ids = []
  editForm.refreshTime = 0
  editForm.content = ''
  editForm.hiddenFlag = HiddenFlagEnum.SHOW
}

const handleSelectionChange = (val: API.MarkerVo[]) => {
  editForm.ids = val.map(marker => marker.id as number)
}

// ==================== 分页 ====================
const { layout, pagination } = usePagination({
  units: [PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.SIZE, PgUnit.TOTAL],
})

// ==================== 地区 ====================
const { areaTree } = useAreaList({ immediate: true })

// ==================== 类型 ====================
const { typeOptions: itemTypeOptions } = useItemType()

// ==================== 物品 ====================
const { itemOptions } = useItemList({
  params: () => ({
    areaIdList: queryForm.areaIdList,
    typeIdList: queryForm.typeIdList,
  }),
})

// 当已选物品不存在于物品选项中时，重置已选物品
watch(itemOptions, (options) => {
  for (const itemId of queryForm.itemIdList) {
    if (!options.find(opt => opt.value === itemId)) {
      queryForm.itemIdList = []
      return
    }
  }
})

// ==================== 点位 ====================
const { markerList, loading, updateMarkerList, onSuccess: onMarkerFetched } = useSearchMarkerList({
  pagination,
  params: () => {
    return {
      ...queryForm,
      markerIdList: queryMarkerIdList.value,
      current: pagination.value.current,
      size: pagination.value.pageSize,
    }
  },
})
onMarkerFetched(({ total }) => (pagination.value.total = total))

const resetQueryForm = () => {
  queryForm.areaIdList = []
  queryForm.itemIdList = []
  queryForm.typeIdList = []
  queryForm.getBeta = false
  queryForm.hiddenFlagList = []
  queryForm.markerIds = ''
}

const { updateMarkerInfo, onSuccess: onBatchUpdateSuccess } = useMarkerBatchUpdate({
  params: () => ({
    ids: editForm.ids,
    refreshTime: editForm.refreshTime,
    content: editForm.content,
    hiddenFlag: editForm.hiddenFlag,
  }),
})
onBatchUpdateSuccess(updateMarkerList)

const positionFormatter = (val: string) => {
  const [x, y] = val.split(',')
  const numX = Math.floor(parseFloat(x))
  const numY = Math.floor(parseFloat(y))
  return `(${numX}, ${numY})`
}

const tableContainerRef = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(tableContainerRef)
</script>

<template>
  <div class="h-full flex flex-col">
    <el-form class="w-full grid grid-cols-4" :inline="true" :model="queryForm">
      <el-form-item label="点位 id: ">
        <el-input v-model="queryForm.markerIds" placeholder="可使用逗号分隔查询多个" style="width: 100%" />
      </el-form-item>
      <el-form-item label="地区">
        <el-tree-select
          v-model="queryForm.areaIdList"
          multiple
          placeholder="请选择地区"
          node-key="id"
          collapse-tags
          collapse-tags-tooltip
          style="width: 100%"
          :data="areaTree"
          :render-after-expand="false"
          :props="{ label: 'name' }"
        />
      </el-form-item>
      <el-form-item label="类型">
        <el-select-v2
          v-model="queryForm.typeIdList"
          multiple
          placeholder="请选择点位类型"
          collapse-tags
          collapse-tags-tooltip
          filterable
          style="width: 100%"
          :options="itemTypeOptions"
        />
      </el-form-item>
      <el-form-item label="物品">
        <el-select-v2
          v-model="queryForm.itemIdList"
          multiple
          placeholder="请选择物品"
          collapse-tags
          collapse-tags-tooltip
          filterable
          style="width: 100%"
          :options="itemOptions"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="resetQueryForm">
          重置
        </el-button>
        <el-button :disabled="!editForm.ids.length" @click="multipleEditDialogVisible = true">
          批量修改
        </el-button>
      </el-form-item>
    </el-form>

    <div ref="tableContainerRef" v-loading="loading" element-loading-text="点位加载中..." class="flex-1 overflow-hidden">
      <el-table :data="markerList" border :width="width" :max-height="height" :height="height" @selection-change="handleSelectionChange">
        <el-table-column type="selection" :width="55" />
        <el-table-column prop="id" label="点位 id" :width="100" />
        <el-table-column prop="markerTitle" label="点位名称" :width="200" />
        <el-table-column prop="position" label="点位位置" :width="150">
          <template #default="{ row }">
            {{ positionFormatter(row.position) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="点位描述" :width="300" show-overflow-tooltip />
        <el-table-column prop="picture" label="点位图片" :width="100">
          <template #default="{ row }">
            <el-link v-if="row.picture" type="primary" :href="row.picture" target="_blank">
              图片链接
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="videoPath" label="点位视频" :width="100">
          <template #default="{ row }">
            <el-link v-if="row.videoPath" type="primary" :href="row.videoPath" target="_blank">
              视频链接
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="markerCreatorId" label="点位创建者" :width="150" />
        <el-table-column prop="pictureCreatorId" label="点位图片创建者" :width="150" />
        <el-table-column prop="refreshTime" label="刷新时间" :width="150" />
        <el-table-column prop="hiddenFlag" label="是否隐藏" :width="100">
          <template #default="{ row }">
            {{ row.hiddenFlag ? '是' : '否' }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="flex justify-center mt-4">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :layout="layout"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :disabled="loading"
        background
      />
    </div>

    <!-- TODO 抽离为组件 -->
    <el-dialog
      v-model="multipleEditDialogVisible"
      title="批量编辑"
      width="50%"
      @closed="resetEditForm"
    >
      <div class="p-5">
        <el-form :model="editForm">
          <el-form-item label="点位 id">
            <span>{{ editForm.ids.join(', ') }}</span>
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
          <el-button type="primary" @click="updateMarkerInfo">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
