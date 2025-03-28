import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 操作日志分页 操作日志分页 POST /system/action_log/list */
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
