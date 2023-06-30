<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useIconList } from '../hooks'
import Api from '@/api/api'
import { PgUnit, useFetchHook, usePagination } from '@/hooks'
import { Logger } from '@/utils'

const logger = new Logger('[icon]')

const iconList = ref<API.IconVo[]>([])
const selectedType = ref<number>(-1)

const { pagination, layout } = usePagination({
  units: [PgUnit.TOTAL, PgUnit.PREV, PgUnit.PAGER, PgUnit.NEXT, PgUnit.SIZE],
})

// 图标编辑表单
const editFormVisible = ref(false)
const editingIcon = ref<API.IconVo>({
  id: 0,
  name: '',
  typeIdList: [],
  url: '',
})
const editFormTitle = computed(() => `编辑图标 ID:${editingIcon.value.id}`)

// 图标编辑
const editIcon = (icon: API.IconVo) => {
  editingIcon.value = icon
  editFormVisible.value = true
}

// 报错处理
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
const params = computed(() => ({
  size: pagination.value.pageSize,
  current: pagination.value.current,
  typeIdList: selectedType.value === -1 ? undefined : [selectedType.value],
}))
const { refresh, onSuccess, onError } = useIconList(params)

onMounted(refresh)

onSuccess(({ record, total }) => {
  iconList.value = record
  pagination.value.total = total
})

onError(error)

// 筛选条件变化时刷新
watch(selectedType, () => {
  refresh()
  pagination.value.current = 1
})

// 编辑图标请求
const saveIcon = async () => {
  let updateIcon: API.IconVo = {
    id: 0,
    name: '',
    typeIdList: [],
    url: '',
  }
  // 仅提交修改的字段
  updateIcon = {
    id: editingIcon.value.id,
    name: editingIcon.value.name,
    typeIdList: editingIcon.value.typeIdList,
    url: editingIcon.value.url,
  }
  console.log(updateIcon)
  const { data } = await Api.icon.updateIcon(updateIcon)
  if (data) {
    ElMessage.success('保存成功')
    editFormVisible.value = false
    refresh()
  }
  else {
    ElMessage.error('修改失败')
    refresh()
  }
}

const tableContainerRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableContainerRef)

const urlFormatter = (_: unknown, __: unknown, url = '') => {
  return decodeURIComponent(url)
}
</script>

<template>
  <el-dialog v-model="editFormVisible" :title="editFormTitle" width="500px">
    <el-form :model="editingIcon" class="mx-4" label-width="90px">
      <el-form-item label="名称">
        <el-input v-model="editingIcon.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="图标类型">
        <el-select v-model="editingIcon.typeIdList" placeholder="请选择图标类型" multiple>
          <el-option
            v-for="item in iconTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图标url">
        <el-input v-model="editingIcon.url" autocomplete="off" />
      </el-form-item>
      <el-form-item v-if="editingIcon.url" label="图标预览">
        <img
          :src="editingIcon.url"
          style="width: 50px; height: 50px; object-fit: contain"
        >
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveIcon">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>

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
            <span v-for="typeId in scope.row.typeIdList" :key="typeId">
              {{ iconTypeMap[typeId] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updater.nickname" label="最新更改者" width="150px" />
        <el-table-column prop="url" label="url" min-width="400px" :formatter="urlFormatter" />
        <el-table-column label="操作" width="100px">
          <template #default="scope">
            <el-button size="small" @click.stop="editIcon(scope.row)">
              编辑
            </el-button>
          </template>
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
