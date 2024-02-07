import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 返回可用角色列表 返回可用角色列表 GET /system/role/list */
export async function listRole(options?: AxiosRequestConfig) {
  return request<API.RListSysRoleVo>('/system/role/list', {
    method: 'GET',
    ...(options || {}),
  })
}
