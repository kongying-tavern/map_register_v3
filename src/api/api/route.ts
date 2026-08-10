import type { AxiosRequestConfig } from 'axios'
import type { PageSearchVo, RBoolean, RListRouteVo, RLong, RouteSearchVo, RouteVo, RPageListVoRouteVo } from '../alova/globals'
import { request } from '@/utils'

/** 新增路线 返回新增路线ID PUT /api/route/add */
export async function createRoute(body: RouteVo, options?: AxiosRequestConfig) {
  return request<RLong>('/api/route/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 修改路线 修改路线 POST /api/route */
export async function updateRoute(body: RouteVo, options?: AxiosRequestConfig) {
  return request<RBoolean>('/api/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据条件筛选分页查询路线信息 根据条件筛选分页查询路线信息，会根据当前角色决定不同的显隐等级 POST /api/route/get/search */
export async function listRoutePageSearch(
  body: RouteSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RPageListVoRouteVo>('/api/route/get/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询所有路线信息 分页查询所有路线信息，会根据当前角色决定不同的显隐等级 POST /api/route/get/page */
export async function listRoutePage(
  body: PageSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<RPageListVoRouteVo>('/api/route/get/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据id列表查询路线信息 根据id列表查询路线信息，会根据当前角色决定不同的显隐等级 POST /api/route/get/list_byid */
export async function listRouteById(body: number[], options?: AxiosRequestConfig) {
  return request<RListRouteVo>('/api/route/get/list_byid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 删除路线 删除路线，请在前端做二次确认 DELETE /api/route/${param0} */
export async function deleteRoute(
  params: {
    // path
    routeId: number
  },
  options?: AxiosRequestConfig,
) {
  const { routeId: param0, ...queryParams } = params
  return request<RBoolean>(`/api/route/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}
