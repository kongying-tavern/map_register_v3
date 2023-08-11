import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ScoreVo } from '../shared'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

interface ScoreHookOptions {
  getParams: () => API.ScoreParamsVo
}

/** 列表数据与核心操作封装 */
export const useScore = (options: ScoreHookOptions) => {
  const { getParams } = options

  const scoreData = ref<ScoreVo[]>([])

  const params = computed(() => getParams())

  // 获取评分数据
  const { refresh: updateScore, onSuccess, ...rest } = useFetchHook({
    immediate: true,
    onRequest: () => {
      return Api.score.getData(params.value)
    },
  })
  onSuccess(({ data = [] }) => {
    scoreData.value = data as ScoreVo[]
  })

  // 生成评分数据
  const { refresh: generateScore, onSuccess: onGenerateSuccess, loading: generateLoading } = useFetchHook({
    immediate: false,
    onRequest: () => {
      return Api.score.generate({}, params.value)
    },
  })
  onGenerateSuccess(() => {
    updateScore()
    ElMessage.success('生成数据成功')
  })

  watch(() => getParams(), updateScore, { deep: true })

  return {
    scoreData,
    generateLoading,
    updateScore,
    generateScore,
    ...rest,
  }
}
