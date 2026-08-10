import type { AxiosRequestConfig } from 'axios'
import type { HistorySearchVo, RPageListVoHistoryVo } from '../alova/globals'
import { request } from '@/utils'

/** 历史记录分页 历史记录分页 POST /api/history/get/list */
export async function searchHistory(
  body: HistorySearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RPageListVoHistoryVo>('/api/history/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
