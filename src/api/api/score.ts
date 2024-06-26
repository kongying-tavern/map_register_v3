import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 生成评分 生成评分数据 POST /api/score/generate */
export async function generate(
  body: API.ScoreParamsVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RObject>('/api/score/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取评分 获取评分数据 POST /api/score/data */
export async function getData(body: API.ScoreParamsVo, options?: AxiosRequestConfig) {
  return request<API.RObject>('/api/score/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
