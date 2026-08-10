import type { AxiosRequestConfig } from 'axios'
import type { MarkerSearchVo, MarkerVo, PageSearchVo, RBoolean, RListLong, RListMarkerVo, RLong, RPageListVoMarkerVo, TweakVo } from '../alova/globals'
import { request } from '@/utils'

/** 新增点位（不包括额外字段） 新增完成后返回点位ID PUT /api/marker/single */
export async function createMarker(body: MarkerVo, options?: AxiosRequestConfig) {
  return request<RLong>('/api/marker/single', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 修改点位（不包括额外字段） 根据点位ID修改点位 POST /api/marker/single */
export async function updateMarker(body: MarkerVo, options?: AxiosRequestConfig) {
  return request<RBoolean>('/api/marker/single', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 调整点位 对点位数据进行微调 POST /api/marker/tweak */
export async function tweakMarkers(
  body: TweakVo[],
  options?: AxiosRequestConfig,
) {
  return request<RListMarkerVo>('/api/marker/tweak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询所有点位信息 分页查询所有点位信息 POST /api/marker/get/page */
export async function listMarkerPage(
  body: PageSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RPageListVoMarkerVo>('/api/marker/get/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据各种条件筛选查询点位信息 支持根据末端地区、末端类型、物品来进行查询，三种查询不能同时生效，同时存在时报错，同时支持测试点位获取 POST /api/marker/get/list_byinfo */
export async function searchMarker(
  body: MarkerSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RListMarkerVo>('/api/marker/get/list_byinfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 通过ID列表查询点位信息 通过ID列表来进行查询点位信息 POST /api/marker/get/list_byid */
export async function listMarkerById(body: number[], options?: AxiosRequestConfig) {
  return request<RListMarkerVo>('/api/marker/get/list_byid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据各种条件筛选查询点位ID 支持根据末端地区、末端类型、物品来进行查询，三种查询不能同时生效，同时存在时报错，同时支持测试点位获取 POST /api/marker/get/id */
export async function searchMarkerId(
  body: MarkerSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RListLong>('/api/marker/get/id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除点位 根据点位ID列表批量删除点位 DELETE /api/marker/${param0} */
export async function deleteMarker(
  params: {
    // path
    markerId: number
  },
  options?: AxiosRequestConfig,
) {
  const { markerId: param0, ...queryParams } = params
  return request<RBoolean>(`/api/marker/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
