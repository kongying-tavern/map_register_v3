import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 历史记录分页 历史记录分页 POST /system/action_log/list */
export async function searchActionLog(
  body: API.SysActionLogSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RPageListVoSysActionLogVo>('/system/action_log/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
