import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 更新用户设备信息 更新用户设备信息 POST /system/device/update */
export async function updateDevice(
  body: API.SysUserDeviceVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RBoolean>('/system/device/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 查询用户设备列表 查询用户设备列表 POST /system/device/list */
export async function searchPage(
  body: API.SysUserDeviceSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RPageListVoSysUserDeviceVo>('/system/device/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
