import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 关联点位 关联点位数据 POST /api/marker_link/link */
export async function linkMarker(
  params: NonNullable<unknown>,
  body: API.MarkerLinkageVo[],
  options?: AxiosRequestConfig,
) {
  return request<API.RString>('/api/marker_link/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  })
}

/** 关联点位列表 关联点位列表 POST /api/marker_link/get/list */
export async function getList(
  body: API.MarkerLinkageSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RMapStringListMarkerLinkageVo>('/api/marker_link/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 关联点位图数据 关联点位图数据 POST /api/marker_link/get/graph */
export async function getGraph(
  body: API.MarkerLinkageSearchVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RMapStringGraphVo>('/api/marker_link/get/graph', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
