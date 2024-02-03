<script lang="ts" setup>
import dayjs from 'dayjs'
import { useScore } from './hooks'
import { ScoreFilter, ScoreTable } from './components'

const init = () => {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
  return [dayjs(start).format('YYYY-MM-DDThh:mm:ss.0000'), dayjs(end).format('YYYY-MM-DDThh:mm:ss.0000')]
} // 默认: 一周

const data = ref<string[]>(init())

const { scoreData, loading, generateLoading, generateScore, updateScore } = useScore({
  getParams: () => ({
    scope: 'PUNCTUATE',
    startTime: data.value[0],
    endTime: data.value[1],
    span: 'DAY',
  }),
})
</script>

<template>
  <div class="h-full flex flex-col gap-2 overflow-hidden p-4">
    <ScoreFilter v-model="data">
      <template #footer>
        <el-button :loading="generateLoading" @click="() => generateScore()">
          生成数据
        </el-button>
        <el-button :loading="loading" @click="() => updateScore()">
          刷新
        </el-button>
      </template>
    </ScoreFilter>

    <ScoreTable :data="scoreData" :loading="loading" />
  </div>
</template>

<style lang="scss" scoped>
.user-table {
  :deep(.el-table__cell) {
    padding: 6px 0;
  }
}
</style>
