import type { AxiosRequestConfig } from 'axios'
import type { AreaSearchVo, AreaVo, RAreaVo, RBoolean, RListAreaVo, RLong } from '../alova/globals'
import { request } from '@/utils'

/** 新增地区 返回新增地区ID PUT /api/area/add */
export async function createArea(body: AreaVo, options?: AxiosRequestConfig) {
  return request<RLong>('/api/area/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 修改地区 修改地区 POST /api/area/update */
export async function updateArea(body: AreaVo, options?: AxiosRequestConfig) {
  return request<RBoolean>('/api/area/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取单个地区信息 获取单个地区信息 POST /api/area/get/${param0} */
export async function getArea(
  params: {
    // path
    areaId: number
  },
  options?: AxiosRequestConfig,
) {
  const { areaId: param0, ...queryParams } = params
  return request<RAreaVo>(`/api/area/get/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 列出地区 可根据父级地区id列出子地区列表 POST /api/area/get/list */
export async function listArea(body: AreaSearchVo, options?: AxiosRequestConfig) {
  return request<RListAreaVo>('/api/area/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除地区 此操作会递归删除，请在前端做二次确认 DELETE /api/area/${param0} */
export async function deleteArea(
  params: {
    // path
    areaId: number
  },
  options?: AxiosRequestConfig,
) {
  const { areaId: param0, ...queryParams } = params
  return request<RBoolean>(`/api/area/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
