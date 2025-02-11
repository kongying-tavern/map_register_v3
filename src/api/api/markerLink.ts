import type { AxiosRequestConfig } from 'axios'
import { request } from '@/utils'

/** 关联点位 关联点位数据 POST /api/marker_link/link */
export async function linkMarker(
  body: API.MarkerLinkageVo[],
  options?: AxiosRequestConfig,
) {
  return request<API.RString>('/api/marker_link/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 关联点位列表 关联点位列表 POST /api/marker_link/get/list */
export async function getMarkerLinkageList(
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
export async function getMarkerLinkageGraph(
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

/** 删除点位关联 删除点位关联 DELETE /api/marker_link/delete */
export async function deleteMarkerLinkage(
  body: API.LinkDeleteQueryVo,
  options?: AxiosRequestConfig,
) {
  return request<API.RLinkDeleteVo>('/api/marker_link/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
