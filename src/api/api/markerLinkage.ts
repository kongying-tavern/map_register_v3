import { request } from '@/utils'

/** 关联点位 关联点位数据 POST /api/marker_linkage/link */
export async function linkMarker(
  body: API.MarkerLinkageVo[],
  options?: { [key: string]: unknown },
) {
  return request<API.RString>('/api/marker_linkage/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 关联点位列表 关联点位列表 POST /api/marker_linkage/get/list */
export async function getList(
  body: API.MarkerLinkageSearchVo,
  options?: { [key: string]: unknown },
) {
  return request<API.RMapStringListMarkerLinkageVo>('/api/marker_linkage/get/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 关联点位图数据 关联点位图数据 POST /api/marker_linkage/get/graph */
export async function getGraph(
  body: API.MarkerLinkageSearchVo,
  options?: { [key: string]: unknown },
) {
  return request<API.RMapStringGraphVo>('/api/marker_linkage/get/graph', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
