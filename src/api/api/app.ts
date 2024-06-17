import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 触发应用更新 触发应用更新 POST /api/app/trigger/update */
export async function triggerAppUpdate(options?: AxiosRequestConfig) {
  return request<API.RBoolean>('/api/app/trigger/update', {
    method: 'POST',
    ...(options || {}),
  })
}
