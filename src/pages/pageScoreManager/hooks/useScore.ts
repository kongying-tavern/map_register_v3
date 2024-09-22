import { ElMessage } from 'element-plus'
import type { FormatedScore, ScoreVo } from '../shared'
import { useFetchHook } from '@/hooks'
import Api from '@/api/api'

export interface ScoreFilterParmas {
  range: [number, number]
}

/** 列表数据与核心操作封装 */
export const useScore = (form: Ref<ScoreFilterParmas>) => {
  // 获取评分数据
  const { onError, ...rest } = useFetchHook({
    initialValue: [],
    immediate: true,
    onRequest: async () => {
      const { range } = toValue(form)
      const [startTime, endTime] = range

      const payload: API.ScoreParamsVo = {
        startTime: startTime as unknown as string,
        endTime: endTime as unknown as string,
        span: 'DAY',
        scope: 'PUNCTUATE',
      }

      const { data: status, message = '' } = await Api.score.generate(payload)
      if (status !== 'ok')
        throw new Error(message)

      const { data = [] } = await Api.score.getData(payload)

      const formatedData: FormatedScore[] = (data as ScoreVo[]).map(({ data, userId, user, ...rest }) => ({
        ...rest,
        ...user,
        nickname: user.nickname || user.username || `(id:${userId})`,
        data,
        userId,
        totalChars: Object.values(data.chars).reduce((sum, count = 0) => sum + count, 0),
        totalCount: Object.values(data.fields).reduce((sum, count = 0) => sum + count, 0),
      }))

      const res = formatedData.toSorted(({ userId: idA }, { userId: idB }) => {
        return idA - idB
      })

      return res
    },
  })

  onError((err) => {
    ElMessage.error({
      message: `获取评分数据失败，原因为：${err.message}`,
    })
  })

  return {
    onError,
    ...rest,
  }
}
