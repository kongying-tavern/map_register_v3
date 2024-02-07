import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 历史记录分页 历史记录分页 POST /api/history/get/list */
export async function getList1(
  body: API.HistorySearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RPageListVoHistoryVo>('/api/history/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
