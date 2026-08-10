import type { AxiosRequestConfig } from 'axios'
import type { RBoolean } from '../alova/globals'
import { request } from '@/utils'

/** 触发应用更新 触发应用更新 POST /api/app/trigger/update */
export async function triggerAppUpdate(options?: AxiosRequestConfig) {
  return request<RBoolean>('/api/app/trigger/update', {
    method: 'POST',
    ...(options || {}),
  })
}
