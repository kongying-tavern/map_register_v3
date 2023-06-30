<script lang="ts" setup>
defineProps<{
  loading: boolean
  markerList: API.MarkerVo[]
  selections: API.MarkerVo[]
}>()

const emits = defineEmits<{
  'update:selections': [markers: API.MarkerVo[]]
}>()

const tableContainerRef = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(tableContainerRef)

const handleSelectionChange = (val: API.MarkerVo[]) => {
  emits('update:selections', val)
}

const positionFormatter = (val: string) => {
  const [x, y] = val.split(',')
  const numX = Math.floor(parseFloat(x))
  const numY = Math.floor(parseFloat(y))
  return `(${numX}, ${numY})`
}
</script>

<template>
  <div ref="tableContainerRef" v-loading="loading" element-loading-text="点位加载中..." class="flex-1 overflow-hidden">
    <el-table
      :data="markerList"
      :border="true"
      :width="width"
      :max-height="height"
      :height="height"
      @selection-change="handleSelectionChange"
    >
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
</template>
