import type { AxiosRequestConfig } from 'axios'
import type { RPageListVoSysActionLogVo, SysActionLogSearchVo } from '../alova/globals'
import { request } from '@/utils'

/** 操作日志分页 操作日志分页 POST /system/action_log/list */
export async function searchActionLog(
  body: SysActionLogSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RPageListVoSysActionLogVo>('/system/action_log/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
