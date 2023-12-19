<script lang="ts" setup>
import { QuestionFilled, VideoCamera } from '@element-plus/icons-vue'
import { useGlobalDialog } from '@/hooks'
import { refreshTimeFormatter } from '@/utils'
import { AppBilibiliVideoPlayer } from '@/components'

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

const getLargePictureUrl = (url: string) => {
  if (!url)
    return ''
  const previewUrl = new URL(url)
  const pathnames = previewUrl.pathname.split('/')
  pathnames.splice(-1, 1, pathnames.at(-1)?.replace(/\.jpg/, '_large.jpg') ?? '')
  return `${previewUrl.origin}${pathnames.join('/')}`
}

const positionFormatter = (row: API.MarkerVo) => {
  const [x, y] = row.position!.split(',')
  const numX = Math.floor(Number.parseFloat(x))
  const numY = Math.floor(Number.parseFloat(y))
  return `(${numX}, ${numY})`
}

const { DialogService } = useGlobalDialog()

const playBilibiliVideo = (row: API.MarkerVo) => {
  DialogService
    .config({
      alignCenter: true,
      width: 'fit-content',
    })
    .props({
      url: row.videoPath,
    })
    .open(AppBilibiliVideoPlayer)
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
      class="marker-table"
      @selection-change="handleSelectionChange"
    >
      <el-table-column align="center" type="selection" width="50" />

      <el-table-column prop="id" label="ID" :width="100" />

      <el-table-column prop="markerTitle" label="点位名称" :width="150" />

      <el-table-column prop="position" label="点位位置" :width="150" :formatter="positionFormatter" />

      <el-table-column prop="content" label="点位描述" :width="300" show-overflow-tooltip />

      <el-table-column prop="picture" label="点位图片" class-name="compact" :width="101">
        <template #default="{ row }">
          <el-image
            :src="row.picture"
            :z-index="5000"
            :preview-src-list="[
              row.picture,
              getLargePictureUrl(row.picture),
            ]"
            style="width: 100px; height: 100px"
            crossorigin=""
            preview-teleported
            lazy
          >
            <template #error>
              <div class="w-full h-full grid place-content-center place-items-center gap-2">
                <el-icon :size="30">
                  <QuestionFilled />
                </el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>

      <el-table-column prop="videoPath" align="center" label="点位视频" :width="100">
        <template #default="{ row }">
          <el-button v-if="row.videoPath" :icon="VideoCamera" @click="() => playBilibiliVideo(row)" />
        </template>
      </el-table-column>

      <el-table-column prop="creator.nickname" label="点位创建者" :width="150">
        <template #default="{ row }">
          {{ row.creator?.nickname }}
        </template>
      </el-table-column>

      <el-table-column prop="refreshTime" label="刷新时间" :formatter="refreshTimeFormatter" :width="150" />

      <el-table-column prop="hiddenFlag" label="是否隐藏" :width="100">
        <template #default="{ row }">
          {{ row.hiddenFlag ? '是' : '否' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.marker-table {
  :deep(.el-table__body-wrapper .el-table__cell.compact) {
    padding: 0;
    .cell {
      padding: 0;
      line-height: 1;
    }
  }
}
</style>
