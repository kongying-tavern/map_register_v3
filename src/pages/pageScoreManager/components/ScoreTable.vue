<script lang="ts" setup>
import type { ScoreVo } from '../shared'

const props = defineProps<{
  loading: boolean
  data: ScoreVo[]
}>()

const tableRef = ref<HTMLElement | null>(null)
const { height } = useElementSize(tableRef)
</script>

<template>
  <div ref="tableRef" v-loading="loading" element-loading-text="载入中..." class="flex-1 overflow-hidden">
    <el-table
      :data="data"
      :height="height"
      :border="true"
    >
      <el-table-column align="center" label="用户">
        <el-table-column align="center" label="ID" prop="userId" width="60px" />
        <el-table-column align="center" label="QQ" prop="user.qq" width="130px" />
        <el-table-column align="center" label="昵称" prop="user.nickname" width="200px" />
      </el-table-column>
      <el-table-column align="center" label="字数统计">
        <el-table-column align="center" label="标题" prop="data.chars.markerTitle" width="60px" />
        <el-table-column align="center" label="内容" prop="data.chars.content" width="60px" />
      </el-table-column>
      <el-table-column align="center" label="次数统计">
        <el-table-column align="center" label="标题" prop="data.fields.markerTitle" width="60px" />
        <el-table-column align="center" label="内容" prop="data.fields.content" width="60px" />
        <el-table-column align="center" label="位置" prop="data.fields.position" width="60px" />
        <el-table-column align="center" label="隐藏标志" prop="data.fields.hiddenFlag" width="120px" />
        <el-table-column align="center" label="刷新时间" prop="data.fields.refreshTime" width="120px" />
        <el-table-column align="center" label="图片" prop="data.fields.picture" width="60px" />
        <el-table-column align="center" label="视频" prop="data.fields.videoPath" width="60px" />
      </el-table-column>
    </el-table>
  </div>
</template>
